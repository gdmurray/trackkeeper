import time
import json
import gzip
import spotipy
import dateutil.parser

from typing import Optional

from requests import HTTPError
from app.core.celery_app import celery_app
from app.db.supabase import supabase
from datetime import datetime, timedelta, timezone
from app.services.spotify_service import SpotifyService
from app.tasks.diff_snapshots import diff_snapshots
from celery.exceptions import MaxRetriesExceededError
from app.models.spotify_access import SpotifyAccess

def calculate_next_snapshot_date(last_snapshot_date: datetime, song_count: int) -> datetime:
    """Calculate the next snapshot date based on the song count"""
    if song_count < 1000:
        return last_snapshot_date
    elif song_count < 2000:
        return last_snapshot_date + timedelta(days=1)
    elif song_count < 4000:
        return last_snapshot_date + timedelta(days=2)
    elif song_count < 6000:
        return last_snapshot_date + timedelta(days=3)
    else:
        return last_snapshot_date + timedelta(days=4)

@celery_app.task(bind=True, max_retries=3)
def take_snapshot(self, user_id: str, playlist_id: int, spotify_playlist_id: str, spotify_playlist_name: str):
    print(f"Taking user library snapshot for user {user_id} and playlist {playlist_id} : {spotify_playlist_id} : {spotify_playlist_name}")

    # Check if there's a previous snapshot and if it's too soon for a new one
    previous_snapshot = supabase.table('Library Snapshots').select('*').eq('user_id', user_id).eq('playlist_id', playlist_id).order('created_at', desc=True).limit(1).execute()
    
    if previous_snapshot.data and len(previous_snapshot.data) > 0:
        last_snapshot = previous_snapshot.data[0]
        last_snapshot_date = dateutil.parser.parse(last_snapshot['created_at'])
        print(f"Last snapshot date: {last_snapshot_date}")
        next_snapshot_date = calculate_next_snapshot_date(last_snapshot_date, last_snapshot['song_count'])
        print(f"Next snapshot date: {next_snapshot_date}")
        if datetime.now(timezone.utc) < next_snapshot_date:
            print(f"Skipping snapshot for user {user_id} and playlist {playlist_id} because it's too soon")
            return


    spotify_access_result = supabase.table('Spotify Access').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
    if not spotify_access_result or not spotify_access_result.data:
        print(f"Error fetching Spotify access for user {user_id}")
        raise Exception(f"Error fetching Spotify access for user {user_id}")
    
    spotify_access: SpotifyAccess = SpotifyAccess(**spotify_access_result.data[0])
    spotify_service = SpotifyService(spotify_access)
    
    # Get Spotify user id
    user = supabase.auth.admin.get_user_by_id(user_id)
    spotify_user_id = user.user.user_metadata['provider_id']

    # File Information
    timestamp = int(time.time())
    file_name = f"{user_id}/snapshot_{spotify_playlist_id}_{timestamp}.json.gz"

    # Fetch all tracks
    try:
        if spotify_playlist_id == 'liked_songs':
            print(f"Getting liked songs for user {user_id}")
            all_tracks = spotify_service.get_user_liked_songs()
        else:
            print(f"Getting playlist songs for user {user_id} and playlist {spotify_playlist_id}")
            all_tracks = spotify_service.get_user_playlist_songs(spotify_user_id, spotify_playlist_id)

        if all_tracks is not None:
            count = len(all_tracks)
            json_data = json.dumps(all_tracks).encode('utf-8')
            compressed_data = gzip.compress(json_data)
            result = supabase.storage.from_('user-snapshots').upload(path=file_name, file=compressed_data, file_options={"content-type": "application/gzip"})
            print(f"File uploaded successfully {file_name}: {result}")
        else:
            raise Exception(f"No tracks found for user {user_id} and playlist {playlist_id}: {all_tracks}")
        
    except (HTTPError, spotipy.SpotifyException) as exc:
        print(f"Error taking snapshot for user {user_id}: {exc}, {spotify_playlist_id}")
        now = datetime.now(timezone.utc).isoformat()
        # Mark token as expired
        supabase.table('Spotify Access').update({'expires_at': now}).eq('id', spotify_access.id).execute()
        try:
            print(f"Retrying snapshot for user {user_id}")
            self.retry(countdown=60)
        except MaxRetriesExceededError:
            print(f"Max retries exceeded for user {user_id}")
        return
    except Exception as exc:
        print(f"Unexpected error occurred: {str(exc)}")
        return
    
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