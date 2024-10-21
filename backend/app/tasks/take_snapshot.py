from typing import Optional

from requests import HTTPError
from app.core.celery_app import celery_app
from app.db.supabase import supabase
from datetime import datetime, timezone
from app.services.spotify_service import spotify_service
from app.tasks.diff_snapshots import diff_snapshots
import spotipy
from celery.exceptions import MaxRetriesExceededError


@celery_app.task(bind=True, max_retries=3)
def take_snapshot(self, user_id, playlist_id: int, spotify_playlist_id: str, spotify_playlist_name: str):
    print(f"Taking user library snapshot for user {user_id} and playlist {playlist_id} : {spotify_playlist_id} : {spotify_playlist_name}")
    access_token, token_id = spotify_service.get_access_token(user_id)
    user = supabase.auth.admin.get_user_by_id(user_id)
    spotify_user_id = user.user.user_metadata['provider_id']
    if not access_token:
        print(f"No Spotify access found for user {user_id}")
        return
    
    print(f"Access Token: {access_token}, token_id: {token_id}")
    try:
        if spotify_playlist_id == 'liked_songs':
            print(f"Getting liked songs for user {user_id}")
            file_name, count = spotify_service.get_user_liked_songs(access_token, user_id)
            print("[Liked] Post File Name: ", file_name)
        else:
            file_name, count = spotify_service.get_user_playlist_songs(access_token, user_id, spotify_user_id, spotify_playlist_id)
            print("[Playlist] Post File Name: ", file_name)
    except (HTTPError, spotipy.SpotifyException) as exc:
        print(f"Error taking snapshot for user {user_id}: {exc}, {spotify_playlist_id}")
        now = datetime.now(timezone.utc).isoformat()
        supabase.table('Spotify Access').update({'expires_at': now}).eq('id', token_id).execute()
        try:
            print(f"Retrying snapshot for user {user_id}")
            self.retry(countdown=60)
        except MaxRetriesExceededError:
            print(f"Max retries exceeded for user {user_id}")
        return
    except Exception as exc:
        print(f"Unexpected error occurred: {str(exc)}")
        return
    if file_name is not None:
        snapshot_data = {
            'user_id': user_id,
            'song_count': count,
            'playlist_id': playlist_id, # Supabase id
            'snapshot_id': file_name  # Using file_name as the snapshot_id
        }
        
        result = supabase.table('Library Snapshots').insert(snapshot_data).execute()
        if result.data:
            diff_snapshots.delay(user_id, spotify_user_id, playlist_id)
            print(f"Snapshot taken for user {user_id} with file name {file_name} and song count {count}")
        else:
            print(f"Failed to take snapshot for user {user_id}")
    return
