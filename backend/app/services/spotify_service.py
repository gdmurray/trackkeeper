from typing import Dict, List, Optional, Tuple
from sklearn.preprocessing import StandardScaler
import spotipy

from datetime import datetime, timezone
from spotipy.oauth2 import SpotifyClientCredentials

from app.core.config import settings
from app.db.supabase import supabase
from app.models.track import Track
from app.models.spotify_access import SpotifyAccess
from app.models.cached_tracks import CachedTrack
from app.models.tracked_playlists import TrackedPlaylist

import numpy as np
class SpotifyService:
    def __init__(self, spotify_access: Optional[SpotifyAccess] = None):
        access_token = self.get_access_token(spotify_access)
        if not access_token:
            raise Exception(f"Could not get access token for user {spotify_access.user_id}")
        self.sp = spotipy.Spotify(auth=access_token)
        self.cache = {
            'top_tracks': None,
            'top_artists': None,
            'audio_features': {},
            'artist_genres': {}
        }
    
    def create_playlist(self, user_id: str, tracked_playlist: TrackedPlaylist):
        result = self.sp.user_playlist_create(user_id, tracked_playlist.removed_playlist_name, public=tracked_playlist.public, description=f"A list of all the tracks in {tracked_playlist.playlist_name} that have been removed. Managed by TrackKeeper.")
        print("Playlist Created: ", result)
        return result['id']
    
    def remove_tracks_from_playlist(self, playlist_id: str, track_ids: list[str]):
        body = [{"uri": f"spotify:track:{tid}"} for tid in track_ids]
        self.sp.playlist_remove_all_occurrences_of_items(playlist_id=playlist_id, items=body)

    def add_tracks_to_playlist(self, playlist_id: str, track_ids: list[str]):
        self.sp.playlist_add_items(playlist_id, track_ids)

    def get_user_top_tracks(self, limit: int = 50) -> List[Dict]:
        if not self.cache['top_tracks']:
            self.cache['top_tracks'] = self.sp.current_user_top_tracks(limit=limit, time_range='medium_term')['items']
        return self.cache['top_tracks']

    def get_user_top_artists(self, limit: int = 50) -> List[Dict]:
        if not self.cache['top_artists']:
            self.cache['top_artists'] = self.sp.current_user_top_artists(limit=limit, time_range='medium_term')['items']
        return self.cache['top_artists']

    def get_audio_features(self, track_ids: List[str]) -> List[Dict]:
        missing_ids = [tid for tid in track_ids if tid not in self.cache['audio_features']]
        if missing_ids:
            features = self.sp.audio_features(missing_ids)
            for tid, feature in zip(missing_ids, features):
                if feature:  # Check if feature is not None
                    self.cache['audio_features'][tid] = feature
        return [self.cache['audio_features'].get(tid) for tid in track_ids if self.cache['audio_features'].get(tid)]

    def get_artist_genres(self, artist_id: str) -> List[str]:
        if artist_id not in self.cache['artist_genres']:
            self.cache['artist_genres'][artist_id] = self.sp.artist(artist_id)['genres']
        return self.cache['artist_genres'][artist_id]
    
    def search_track(self, track_name: str, artist_name: str) -> Optional[Dict]:
        query = f"track:{track_name} artist:{artist_name}"
        results = self.sp.search(q=query, type='track', limit=1)
        if results['tracks']['items']:
            return results['tracks']['items'][0]
        else:
            return None
    
    def calculate_similarity(self, track1_features: Dict, track1_info: Dict, 
                             track2_features: Dict, track2_info: Dict, 
                             user_top_artists: List[Dict]) -> float:
        audio_features = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo']
        
        # Audio feature similarity
        vec1 = np.array([track1_features[feature] for feature in audio_features])
        vec2 = np.array([track2_features[feature] for feature in audio_features])
        
        scaler = StandardScaler()
        vec1_normalized = scaler.fit_transform(vec1.reshape(-1, 1)).flatten()
        vec2_normalized = scaler.transform(vec2.reshape(-1, 1)).flatten()
        
        feature_similarity = 1 / (1 + np.linalg.norm(vec1_normalized - vec2_normalized))
        
        # Key similarity
        key_distance = min(abs(track1_features['key'] - track2_features['key']), 12 - abs(track1_features['key'] - track2_features['key'])) / 6.0
        key_similarity = 1 - key_distance
        
        # Mode similarity
        mode_similarity = 1 if track1_features['mode'] == track2_features['mode'] else 0
        
        # Artist similarity
        artist1_id = track1_info['artists'][0]['id']
        artist2_id = track2_info['artists'][0]['id']
        top_artist_ids = [artist['id'] for artist in user_top_artists]
        
        artist_similarity = 0
        if artist1_id == artist2_id:
            artist_similarity = 1
        elif artist1_id in top_artist_ids and artist2_id in top_artist_ids:
            artist_similarity = 0.8
        elif artist1_id in top_artist_ids or artist2_id in top_artist_ids:
            artist_similarity = 0.5
        
        # Genre similarity
        genres1 = set(self.get_artist_genres(artist1_id))
        genres2 = set(self.get_artist_genres(artist2_id))
        genre_similarity = len(genres1.intersection(genres2)) / max(len(genres1.union(genres2)), 1)
        
        # Weighted average of similarities
        weights = [0.4, 0.1, 0.05, 0.25, 0.2]  # for feature, key, mode, artist, and genre similarities
        final_similarity = sum([
            weights[0] * feature_similarity,
            weights[1] * key_similarity,
            weights[2] * mode_similarity,
            weights[3] * artist_similarity,
            weights[4] * genre_similarity
        ])
        
        return final_similarity

    def suggest_accidentally_removed_tracks(self, songs: List[str], similarity_threshold: float = 0.7) -> List[Dict]:
        top_tracks = self.get_user_top_tracks(limit=50)
        top_track_ids = [track['id'] for track in top_tracks]
        user_top_artists = self.get_user_top_artists(limit=50)

        # Batch fetch audio features
        all_track_ids = top_track_ids + songs
        self.get_audio_features(all_track_ids)

        # Batch fetch full track info
        tracks_to_fetch = songs + [tid for tid in top_track_ids if tid not in self.cache.get('tracks', {})]
        if tracks_to_fetch:
            track_infos = self.sp.tracks(tracks_to_fetch)['tracks']
            if 'tracks' not in self.cache:
                self.cache['tracks'] = {}
            for track in track_infos:
                self.cache['tracks'][track['id']] = track

        # Batch fetch artist genres
        all_artist_ids = set()
        for track_id in all_track_ids:
            if track_id in self.cache['tracks']:
                all_artist_ids.add(self.cache['tracks'][track_id]['artists'][0]['id'])
        
        missing_artist_ids = [aid for aid in all_artist_ids if aid not in self.cache['artist_genres']]
        if missing_artist_ids:
            for i in range(0, len(missing_artist_ids), 50):  # Spotify allows up to 50 artists per request
                batch = missing_artist_ids[i:i+50]
                artists = self.sp.artists(batch)['artists']
                for artist in artists:
                    self.cache['artist_genres'][artist['id']] = artist['genres']

        suggestions = []

        for track_id in songs:
            track_features = self.cache['audio_features'].get(track_id)
            track_info = self.cache['tracks'].get(track_id)
            
            if not track_features or not track_info:
                print(f"Skipping track {track_id} due to missing data")
                continue

            similarities = [
                self.calculate_similarity(
                    track_features, track_info,
                    self.cache['audio_features'].get(top_id),
                    self.cache['tracks'].get(top_id),
                    user_top_artists
                )
                for top_id in top_track_ids
                if self.cache['audio_features'].get(top_id) and self.cache['tracks'].get(top_id)
            ]
            
            max_similarity = max(similarities) if similarities else 0
            avg_similarity = np.mean(similarities) if similarities else 0
            
            print(f"Track: {track_info['name']} by {track_info['artists'][0]['name']}")
            print(f"Max Similarity: {max_similarity:.4f}")
            print(f"Average Similarity: {avg_similarity:.4f}")

            if max_similarity > similarity_threshold:
                suggestions.append({
                    'id': track_id,
                    'name': track_info['name'],
                    'artist': track_info['artists'][0]['name'],
                    'max_similarity': max_similarity,
                    'avg_similarity': avg_similarity
                })

        suggestions.sort(key=lambda x: x['max_similarity'], reverse=True)
        return suggestions
    
    # Fetch all songs for a user's playlist
    def get_user_playlist_songs(self, spotify_user_id, playlist_id) -> list[Track]:
        all_tracks: list[Track] = []
        total_tracks = 0
        offset = 0
        limit = 100  # Spotify allows up to 100 tracks per request for playlists

        while True:
            results = self.sp.user_playlist_tracks(spotify_user_id, playlist_id, 
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
                    'added_at': item['added_at'],
                    'image': track['album']['images'][0]['url'] if track['album']['images'] else None
                })

            total_tracks += len(results['items'])
            offset += limit

            print(f"Fetched {total_tracks} tracks from playlist so far")

        return all_tracks
    
    # Fetch all liked songs for a user
    def get_user_liked_songs(self) -> list[Track]:
        all_tracks: list[Track] = []
        total_tracks = 0
        offset = 0
        limit = 50

        while True:
            results = self.sp.current_user_saved_tracks(limit=limit, offset=offset)
            if not results['items']:
                break

            for item in results['items']:
                all_tracks.append({
                    'id': item['track']['id'],
                    'name': item['track']['name'],
                    'artist': item['track']['artists'][0]['name'],
                    'album': item['track']['album']['name'],
                    'added_at': item['added_at'],
                    'image': item['track']['album']['images'][0]['url'] if item['track']['album']['images'] else None
                })

            total_tracks += len(results['items'])
            offset += limit

            print(f"Fetched {total_tracks} tracks so far")

        return all_tracks

    def get_tracks_info(self, track_ids):
        # Fetch Full Track information for a list of track ids
        tracks_info = []
        for i in range(0, len(track_ids), 50):
            batch = track_ids[i:i+50]
            results = self.sp.tracks(batch)
            tracks_info.extend(results['tracks'])

        return tracks_info
    
    def get_access_token(self, spotify_access: SpotifyAccess):
        print("Get Access TokenSpotify Access: ", spotify_access)
        if spotify_access:
            access_token = spotify_access.access_token
            refresh_token = spotify_access.refresh_token
            expires_at = spotify_access.expires_at
            
            current_time = datetime.now(timezone.utc)
            if current_time.timestamp() >= expires_at.timestamp():
                # Token has expired, refresh it
                new_access_token, new_expires_at = self.refresh_access_token(refresh_token)
                
                # Convert new_expires_at to datetime if it's an integer
                if isinstance(new_expires_at, int):
                    new_expires_at = datetime.fromtimestamp(new_expires_at, tz=timezone.utc)
                
                # Update the database with new token information
                supabase.table('Spotify Access').update({
                    'access_token': new_access_token,
                    'expires_at': new_expires_at.isoformat()
                }).eq('id', spotify_access.id).execute()
                
                # Use the new access token
                access_token = new_access_token
            return access_token
        else:
            raise Exception(f"No Spotify access found for user {user_id}")
    
    def refresh_access_token(self, refresh_token):
        sp_oauth = spotipy.SpotifyOAuth(
            client_id=settings.SPOTIFY_CLIENT_ID,
            client_secret=settings.SPOTIFY_CLIENT_SECRET,
            redirect_uri='https://fsbhjfbuuxyyqixspxgo.supabase.co/auth/v1/callback',
            scope='user-library-read,user-read-email,playlist-read-private,playlist-modify-private,playlist-modify-public,user-top-read',
        )
        token_info = sp_oauth.refresh_access_token(refresh_token)
        return token_info['access_token'], token_info['expires_at']


# spotify_service = SpotifyService()
