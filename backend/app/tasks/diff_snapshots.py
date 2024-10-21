from datetime import datetime, timezone
import gzip
import json
from typing import Optional
from app.core.celery_app import celery_app
from app.db.supabase import supabase
from app.services.spotify_service import spotify_service

# This Function takes user_id, and playlist_id, which is the supabase integer id for tracked playlist
@celery_app.task
def diff_snapshots(user_id: str, spotify_user_id: str, playlist_id: int):
    print(f"Diffing snapshots for user {user_id}")
    # Fetch the latest two snapshots for the user
    tracked_playlist = supabase.table('Tracked Playlists').select('*').eq('id', playlist_id).single().execute()

    if not tracked_playlist or not tracked_playlist.data:
        print(f"Error fetching tracked playlist for user {user_id}: {tracked_playlist.error}. Task ended.")
        return
    
    snapshots = supabase.table('Library Snapshots').select('*').eq('user_id', user_id).eq('playlist_id', playlist_id).order('created_at', desc=True).limit(2).execute()

    # Check if we have at least two snapshots
    if len(snapshots.data) < 2:
        print(f"Not enough snapshots for user {user_id} to perform diff. Task ended.")
        return

    # If we have enough snapshots, we can proceed with the diff
    latest_snapshot_row = snapshots.data[0]
    previous_snapshot_row = snapshots.data[1]

    if latest_snapshot_row['snapshot_id'] is  None or previous_snapshot_row['snapshot_id'] is None:
        print(f"Snapshot IDs are None for user {user_id}. Task ended.")
        return
    
    old_tracks = set(track['id'] for track in load_snapshot(previous_snapshot_row['snapshot_id']))
    new_tracks = set(track['id'] for track in load_snapshot(latest_snapshot_row['snapshot_id']))

    print("Length Old Tracks: ", len(old_tracks))
    print("Length New Tracks: ", len(new_tracks))
    
    
    removed_tracks = old_tracks - new_tracks

    if not removed_tracks or len(removed_tracks) == 0:
        print(f"No changes found for user {user_id}. Task ended.")
        return
    
    # Fetch Settings For User
    user_settings = supabase.table('User Settings').select('*').eq('user_id', user_id).single().execute()

    if not user_settings or not user_settings.data:
        print(f"Error fetching user settings for user {user_id}. Task ended.")
        return
    
    # if not user_settings.data['create_playlist']:
    #     print(f"User {user_id} does not have create_playlist enabled. Task ended.")
    #     return

    access_token, token_id = spotify_service.get_access_token(user_id)

    if not access_token:
        print(f"No Spotify access found for user {user_id}")
        return
    
    current_time = datetime.now(timezone.utc).isoformat()
    deleted_songs_inserts = [{
        'user_id': user_id, 
        'track_id': track_id, 
        'removed_at': current_time, 
        'playlist_id': playlist_id
        } for track_id in removed_tracks]
    
    supabase.table('Deleted Songs').insert(deleted_songs_inserts).execute()

    removed_playlist_id = tracked_playlist.data['removed_playlist_id']

    # Check if tracked playlist has a spotify playlist id
    # All tracked playlists should have a spotify playlist id, even liked songs
    if not tracked_playlist.data['removed_playlist_id']:
        print("Tracked Playlist: ", tracked_playlist.data)
        # Create new playlist for removed songs
        created_playlist_id = spotify_service.create_playlist(
            access_token,
            spotify_user_id,
            playlist_name=tracked_playlist.data['removed_playlist_name'], 
            public=tracked_playlist.data['public']
        )
        print("Created Playlist ID: ", created_playlist_id)
        
        if not created_playlist_id:
            print(f"Failed to create playlist for user {user_id} Task ended.")
            return
        supabase.table('Tracked Playlists').update({
            'removed_playlist_id': created_playlist_id
        }).eq('user_id', user_id).eq('id', tracked_playlist.data['id']).execute()
        removed_playlist_id = created_playlist_id

    spotify_uris = [f"spotify:track:{track_id}" for track_id in list(removed_tracks)]        
    spotify_service.add_tracks_to_playlist(access_token, playlist_id=removed_playlist_id, track_ids=spotify_uris)    

    print(f"Found snapshots for diff: Latest {latest_snapshot_row['snapshot_id']}, Previous {previous_snapshot_row['snapshot_id']}")

def load_snapshot(file_name):
    try:
        # Download the file
        response = supabase.storage.from_('user-snapshots').download(file_name)
        
        # Decompress the gzip data
        decompressed_data = gzip.decompress(response)
        
        # Parse the JSON data
        tracks = json.loads(decompressed_data.decode('utf-8'))
        
        return tracks
    except Exception as e:
        print(f"Error loading snapshot: {e}")
        return None