import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from app.core.config import settings
import json
import pickle
import base64

class SpotifyService:
    def __init__(self):
        auth_manager = SpotifyClientCredentials(
            client_id=settings.SPOTIFY_CLIENT_ID,
            client_secret=settings.SPOTIFY_CLIENT_SECRET
        )
        self.sp = spotipy.Spotify(auth_manager=auth_manager)

    def get_user_liked_songs(self, access_token):
        sp = spotipy.Spotify(auth=access_token)
        liked_songs = []
        results = sp.current_user_saved_tracks(limit=50)
        while results:
            for item in results['items']:
                track = item['track']
                liked_songs.append({
                    'id': track['id'],
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'album': track['album']['name'],
                    'added_at': item['added_at']
                })
            if results['next']:
                results = sp.next(results)
            else:
                results = None
        
        # Pickle the liked_songs object
        pickled_data = pickle.dumps(liked_songs)
        
        # Encode the pickled data as base64 for JSON compatibility
        encoded_data = base64.b64encode(pickled_data).decode('utf-8')

        return encoded_data, len(liked_songs)
    
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
