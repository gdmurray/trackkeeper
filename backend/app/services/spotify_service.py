from datetime import datetime, timezone
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from app.core.config import settings
from app.db.supabase import supabase
import json
import gzip
import time

class SpotifyService:
    def __init__(self):
        auth_manager = SpotifyClientCredentials(
            client_id=settings.SPOTIFY_CLIENT_ID,
            client_secret=settings.SPOTIFY_CLIENT_SECRET
        )
        self.sp = spotipy.Spotify(auth_manager=auth_manager)
        self.bucket_name = "user-snapshots"

    
    def create_playlist(self, access_token: str, user_id: str, playlist_name: str, public: bool = False):
        sp = spotipy.Spotify(auth=access_token)
        result = sp.user_playlist_create(user_id, playlist_name, public=public)
        print("Playlist Created: ", result)
        return result['id']

    def add_tracks_to_playlist(self, access_token: str, playlist_id: str, track_ids: list[str]):
        sp = spotipy.Spotify(auth=access_token)
        sp.playlist_add_items(playlist_id, track_ids)

    def get_user_playlist_songs(self, access_token, user_id, spotify_user_id, playlist_id):
        timestamp = int(time.time())
        print("User Access Token: ", access_token)
        print("Playlist ID: ", playlist_id)
        sp = spotipy.Spotify(auth=access_token)

        file_name = f"{user_id}/snapshot_{playlist_id}_{timestamp}.json.gz"
        print("[Playlist] Pre File Name: ", file_name)
        all_tracks = []
        total_tracks = 0
        offset = 0
        limit = 100  # Spotify allows up to 100 tracks per request for playlists

        while True:
            results = sp.user_playlist_tracks(spotify_user_id, playlist_id, 
                                        limit=limit, 
                                        offset=offset, 
                                        )
            if not results['items']:
                break

            for item in results['items']:
                track = item['track']
                all_tracks.append({
                    'id': track['id'],
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'album': track['album']['name'],
                    'added_at': item['added_at']
                })

            total_tracks += len(results['items'])
            offset += limit

            print(f"Fetched {total_tracks} tracks from playlist so far")

        # Convert the list to JSON and compress with gzip
        json_data = json.dumps(all_tracks).encode('utf-8')
        compressed_data = gzip.compress(json_data)

        # Upload the compressed file to Supabase storage
        try:
            result = supabase.storage.from_(self.bucket_name).upload(
                path=file_name,
                file=compressed_data,
                file_options={"content-type": "application/gzip"}
            )
            print(f"Playlist file uploaded successfully: {result}")
        except Exception as e:
            print(f"Error uploading playlist file: {e}")
            raise
        return file_name, total_tracks
    
    def get_user_liked_songs(self, access_token, user_id):
        sp = spotipy.Spotify(auth=access_token)
        timestamp = int(time.time())

        file_name = f"{user_id}/snapshot_liked_{timestamp}.json.gz"
        print("[Liked] Pre File Name: ", file_name)
        all_tracks = []
        total_tracks = 0
        offset = 0
        limit = 50

        while True:
            results = sp.current_user_saved_tracks(limit=limit, offset=offset)
            if not results['items']:
                break

            for item in results['items']:
                all_tracks.append({
                    'id': item['track']['id'],
                    'name': item['track']['name'],
                    'artist': item['track']['artists'][0]['name'],
                    'album': item['track']['album']['name'],
                    'added_at': item['added_at']
                })

            total_tracks += len(results['items'])
            offset += limit

            print(f"Fetched {total_tracks} tracks so far")

        # Convert the list to JSON and compress with gzip
        json_data = json.dumps(all_tracks).encode('utf-8')
        compressed_data = gzip.compress(json_data)

        # Upload the compressed file to Supabase storage
        try:
            result = supabase.storage.from_(self.bucket_name).upload(
                path=file_name,
                file=compressed_data,
                file_options={"content-type": "application/gzip"}
            )
            print(f"File uploaded successfully: {result}")
        except Exception as e:
            print(f"Error uploading file: {e}")
            raise

        return file_name, total_tracks

    
    def get_tracks_info(self, track_ids):
        # Fetch Full Track information for a list of track ids
        tracks_info = []
        for i in range(0, len(track_ids), 50):
            batch = track_ids[i:i+50]
            results = self.sp.tracks(batch)
            tracks_info.extend(results['tracks'])

        return tracks_info
    
    def get_access_token(self, user_id):
        spotify_access = supabase.table('Spotify Access').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
        if not spotify_access or not spotify_access.data:
            print(f"Error fetching Spotify access for user {user_id}")
            return None, None
        
        if spotify_access.data:
            access_token = spotify_access.data[0]['access_token']
            refresh_token = spotify_access.data[0]['refresh_token']
            expires_at_str = spotify_access.data[0]['expires_at']
            
            # Handle both timezone-aware and naive timestamps
            try:
                expires_at = datetime.fromisoformat(expires_at_str)
                if expires_at.tzinfo is None:
                    # If naive, assume it's UTC and make it timezone-aware
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
            except ValueError:
                # If fromisoformat fails, fall back to the old method
                expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00')).replace(tzinfo=timezone.utc)

            current_time = datetime.now(timezone.utc)
            if current_time.timestamp() >= expires_at.timestamp():
                # Token has expired, refresh it
                new_access_token, new_expires_at = spotify_service.refresh_access_token(refresh_token)
                
                # Convert new_expires_at to datetime if it's an integer
                if isinstance(new_expires_at, int):
                    new_expires_at = datetime.fromtimestamp(new_expires_at, tz=timezone.utc)
                
                # Update the database with new token information
                supabase.table('Spotify Access').update({
                    'access_token': new_access_token,
                    'expires_at': new_expires_at.isoformat()
                }).eq('user_id', user_id).execute()
                
                # Use the new access token
                access_token = new_access_token
            return access_token, spotify_access.data[0]['id']
        else:
            return None, None
    
    def refresh_access_token(self, refresh_token):
        sp_oauth = spotipy.SpotifyOAuth(
            client_id=settings.SPOTIFY_CLIENT_ID,
            client_secret=settings.SPOTIFY_CLIENT_SECRET,
            redirect_uri='https://fsbhjfbuuxyyqixspxgo.supabase.co/auth/v1/callback',
            scope='user-library-read',
        )
        token_info = sp_oauth.refresh_access_token(refresh_token)
        return token_info['access_token'], token_info['expires_at']


spotify_service = SpotifyService()
