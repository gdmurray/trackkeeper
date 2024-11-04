from datetime import datetime, timezone
import gzip
import json
from typing import Optional
from app.core.celery_app import celery_app
from app.db.supabase import supabase
from app.services.spotify_service import SpotifyService
from app.models.spotify_access import SpotifyAccess
from app.models.cached_tracks import CachedTrackInsert
from app.models.tracked_playlists import TrackedPlaylist
from app.tasks.check_song_expiry import check_song_expiry
from app.core.logging import setup_logging

logger = setup_logging("diff_snapshots")


@celery_app.task
def diff_snapshots(user_id: str, spotify_user_id: str, playlist_id: int):
    """
    This Function takes user_id, and playlist_id, which is the supabase integer id for tracked playlist
    """
    logger.info("Starting diff snapshots task", extra={
                "user_id": user_id, "spotify_user_id": spotify_user_id, "playlist_id": playlist_id})
    current_time = datetime.now(timezone.utc).isoformat()

    # Fetch the tracked playlist
    tracked_playlist_result = supabase.table('Tracked Playlists').select(
        '*').eq('id', playlist_id).single().execute()

    # Check if tracked playlist exists
    if not tracked_playlist_result or not tracked_playlist_result.data:
        logger.error("Error Fetching Tracked Playlist", extra={
                     "user_id": user_id, "spotify_user_id": spotify_user_id, "playlist_id": playlist_id, "tracked_playlist_result": tracked_playlist_result})
        raise Exception(
            f"Error fetching tracked playlist for user: {user_id}: {tracked_playlist_result}")

    tracked_playlist = TrackedPlaylist(**tracked_playlist_result.data)

    # Fetch the latest two snapshots for the user
    snapshots = supabase.table('Library Snapshots').select('*').eq('user_id', user_id).eq(
        'playlist_id', playlist_id).order('created_at', desc=True).limit(2).execute()

    # Check if we have at least two snapshots
    if len(snapshots.data) < 2:
        logger.warning("Not enough snapshots for user to perform diff", extra={
                       "user_id": user_id, "spotify_user_id": spotify_user_id, "playlist_id": playlist_id, "snapshots": snapshots})
        return {
            "message": f"Not enough snapshots for user {user_id} to perform diff. Task ended."
        }

    # If we have enough snapshots, we can proceed with the diff
    latest_snapshot_row = snapshots.data[0]
    previous_snapshot_row = snapshots.data[1]

    if latest_snapshot_row['snapshot_id'] is None or previous_snapshot_row['snapshot_id'] is None:
        logger.error("Snapshot IDs are None for user", extra={"user_id": user_id, "spotify_user_id": spotify_user_id,
                     "playlist_id": playlist_id, "latest_snapshot_row": latest_snapshot_row, "previous_snapshot_row": previous_snapshot_row})
        raise Exception(
            f"Snapshot IDs are None for user {user_id}. Task ended.")

    previous_snapshot = load_snapshot(previous_snapshot_row['snapshot_id'])
    if not previous_snapshot:
        logger.error("Error loading previous snapshot", extra={"user_id": user_id, "spotify_user_id": spotify_user_id, "playlist_id": playlist_id,
                     "latest_snapshot_id": latest_snapshot_row['snapshot_id'], "previous_snapshot_id": previous_snapshot_row['snapshot_id']})
        raise Exception(
            f"Error loading previous snapshot for user {user_id}: {latest_snapshot_row['snapshot_id']} {previous_snapshot_row['snapshot_id']}")

    old_tracks_ids = set(track['id'] for track in previous_snapshot)
    new_tracks_ids = set(track['id'] for track in load_snapshot(
        latest_snapshot_row['snapshot_id']))

    print("Length Old Tracks: ", len(old_tracks_ids))
    print("Length New Tracks: ", len(new_tracks_ids))

    logger.info(
        f"Track Length Comparison {len(old_tracks_ids)} {len(new_tracks_ids)}")

    removed_tracks_ids = old_tracks_ids - new_tracks_ids

    if not removed_tracks_ids or len(removed_tracks_ids) == 0:
        logger.info(f"No changes found for user {user_id}. Task ended.")
        return {
            "message": f"No changes found for user {user_id}. Task ended."
        }

    cached_tracks_upserts: list[CachedTrackInsert] = [{
        'track_id': track['id'],
        'updated_at': current_time,
        'name': track['name'],
        'artist': track['artist'],
        'image': track['image'],
        'album': track['album']
    } for track in previous_snapshot if track['id'] in removed_tracks_ids]

    # Upsert Into Cached Tracks
    cached_tracks_result = supabase.table('Cached Tracks').upsert(
        cached_tracks_upserts, on_conflict='track_id').execute()
    if not cached_tracks_result:
        logger.error("Error upserting Cached Tracks", extra={"user_id": user_id, "spotify_user_id": spotify_user_id,
                     "playlist_id": playlist_id, "cached_tracks_upserts": cached_tracks_upserts, "cached_tracks_result": cached_tracks_result})
        raise Exception(
            f"Error upserting Cached Tracks: {cached_tracks_result}")

    # Fetch Settings For User
    user_settings = supabase.table('User Settings').select(
        '*').eq('user_id', user_id).single().execute()

    if not user_settings or not user_settings.data:
        logger.error("Error fetching user settings", extra={
                     "user_id": user_id, "spotify_user_id": spotify_user_id, "playlist_id": playlist_id, "user_settings": user_settings})
        raise Exception(
            f"Error fetching user settings for user {user_id}. Task ended.")

    spotify_access_result = supabase.table('Spotify Access').select(
        '*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
    if not spotify_access_result or not spotify_access_result.data:
        logger.error("Error fetching Spotify access", extra={
                     "user_id": user_id, "spotify_user_id": spotify_user_id, "playlist_id": playlist_id, "spotify_access_result": spotify_access_result})
        raise Exception(f"Error fetching Spotify access for user {user_id}")

    spotify_access: SpotifyAccess = SpotifyAccess(
        **spotify_access_result.data[0])
    spotify_service = SpotifyService(spotify_access)

    # Insert Deleted Songs
    deleted_songs_inserts = [{
        'user_id': user_id,
        'track_id': track_id,
        'removed_at': current_time,
        'playlist_id': playlist_id
    } for track_id in removed_tracks_ids]

    deleted_songs_result = supabase.table('Deleted Songs').upsert(
        deleted_songs_inserts, on_conflict='track_id,user_id,playlist_id').execute()

    logger.info("Deleted Songs Result", extra={"user_id": user_id, "spotify_user_id": spotify_user_id,
                "playlist_id": playlist_id, "deleted_songs_inserts": deleted_songs_inserts, "deleted_songs_result": deleted_songs_result})

    removed_playlist_id = tracked_playlist.removed_playlist_id

    # Check if tracked playlist has a spotify playlist id
    # All tracked playlists should have a spotify playlist id, even liked songs
    if not tracked_playlist.removed_playlist_id:
        # Create new playlist for removed songs
        created_playlist_id = spotify_service.create_playlist(
            spotify_user_id,
            tracked_playlist
        )

        if not created_playlist_id:
            logger.error("Failed to create playlist", extra={
                         "user_id": user_id, "spotify_user_id": spotify_user_id, "playlist_id": playlist_id, "created_playlist_id": created_playlist_id})
            raise Exception(
                f"Failed to create playlist for user {user_id} Task ended.")

        supabase.table('Tracked Playlists').update({
            'removed_playlist_id': created_playlist_id
        }).eq('user_id', user_id).eq('id', tracked_playlist.id).execute()
        removed_playlist_id = created_playlist_id

    spotify_uris = [
        f"spotify:track:{track_id}" for track_id in list(removed_tracks_ids)]
    spotify_service.add_tracks_to_playlist(
        playlist_id=removed_playlist_id, track_ids=spotify_uris)

    check_song_expiry.apply_async(args=[user_id, playlist_id])
    return {
        "message": f"Found snapshots for diff: Latest {latest_snapshot_row['snapshot_id']}, Previous {previous_snapshot_row['snapshot_id']}"
    }


def load_snapshot(file_name) -> Optional[list[CachedTrackInsert]]:
    try:
        # Download the file
        response = supabase.storage.from_('user-snapshots').download(file_name)

        # Decompress the gzip data
        decompressed_data = gzip.decompress(response)

        # Parse the JSON data
        tracks = json.loads(decompressed_data.decode('utf-8'))

        return tracks
    except Exception as e:
        logger.error("Error loading snapshot", extra={"error": e})
        return None
