from app.core.celery_app import celery_app
from app.db.supabase import supabase
from app.services.spotify_service import SpotifyService
from app.models.deleted_songs import DeletedSong
from app.models.spotify_access import SpotifyAccess
from app.models.tracked_playlists import TrackedPlaylist
from app.models.user_settings import UserSettings
from datetime import datetime, timezone, timedelta
from app.core.logging import setup_logging

logger = setup_logging("check_song_expiry")


@celery_app.task
def check_song_expiry(user_id: str, playlist_id: int):
    """
    This Function takes user_id and playlist_id, and checks if any songs in the deleted songs table have expired
    """
    response = {}
    logger.info("Checking song expiry", extra={
                "user_id": user_id, "playlist_id": playlist_id})

    # Fetch the tracked playlist
    tracked_playlist_result = supabase.table('Tracked Playlists').select(
        '*').eq('id', playlist_id).eq('user_id', user_id).single().execute()

    if not tracked_playlist_result or not tracked_playlist_result.data:
        logger.error("Error fetching tracked playlist", extra={
                     "user_id": user_id, "playlist_id": playlist_id, "tracked_playlist_result": tracked_playlist_result})
        return {
            "message": f"Error fetching tracked playlist for user {user_id}: {tracked_playlist_result}. Task ended."
        }

    tracked_playlist = TrackedPlaylist(**tracked_playlist_result.data)

    user_settings_result = supabase.table('User Settings').select(
        '*').eq('user_id', user_id).single().execute()

    if not user_settings_result or not user_settings_result.data:
        logger.error("Error fetching user settings", extra={
                     "user_id": user_id, "user_settings_result": user_settings_result})
        raise Exception(
            f"Error fetching user settings for user {user_id}: {user_settings_result}. Task ended.")

    user_settings = UserSettings(**user_settings_result.data)

    if user_settings.playlist_persistence == "forever":
        logger.info("Song persistence is set to forever. Task ended.")
        return {
            "message": f"Song persistence is set to forever. Task ended."
        }

    # Fetch the deleted songs
    deleted_songs_result = supabase.table('Deleted Songs').select(
        '*').eq('user_id', user_id).eq('playlist_id', playlist_id).eq('active', True).execute()

    if not deleted_songs_result or not deleted_songs_result.data:
        logger.error("Error fetching deleted songs", extra={
                     "user_id": user_id, "playlist_id": playlist_id, "deleted_songs_result": deleted_songs_result})
        raise Exception(
            f"Error fetching deleted songs for user {user_id}: {deleted_songs_result}. Task ended."
        )

    deleted_songs = [DeletedSong(**song) for song in deleted_songs_result.data]

    songs_to_expire = []
    current_time = datetime.now(timezone.utc)

    # Define persistence periods in days
    persistence_periods = {
        "30 days": 30,
        "90 days": 90,
        "180 days": 180,
        "1 year": 365
    }

    if user_settings.playlist_persistence in persistence_periods:
        max_age_days = persistence_periods[user_settings.playlist_persistence]
        expiry_threshold = current_time - timedelta(days=max_age_days)

        for song in deleted_songs:
            if song.removed_at <= expiry_threshold:
                songs_to_expire.append(song)

    if len(songs_to_expire) > 0:
        if user_settings.remove_from_playlist and tracked_playlist.removed_playlist_id:
            spotify_access_result = supabase.table('Spotify Access').select(
                '*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
            if not spotify_access_result or not spotify_access_result.data:
                logger.error("Error fetching Spotify access", extra={
                             "user_id": user_id, "spotify_access_result": spotify_access_result})
                raise Exception(
                    f"Error fetching Spotify access for user {user_id}")

            spotify_access: SpotifyAccess = SpotifyAccess(
                **spotify_access_result.data[0])
            spotify_service = SpotifyService(spotify_access)

            removed_track_ids = [song.track_id for song in songs_to_expire]
            spotify_service.remove_tracks_from_playlist(
                tracked_playlist.removed_playlist_id, removed_track_ids)
            response['modified_playlist'] = f"Removed {len(removed_track_ids)} tracks from {tracked_playlist.removed_playlist_name}"
        for song in songs_to_expire:
            supabase.table('Deleted Songs').update(
                {'active': False}).eq('id', song.id).execute()
            response['removed_songs'] = f"Removed {len(songs_to_expire)} songs from Deleted Songs table"

        return response

    logger.info("No songs to expire", extra={
                "user_id": user_id, "playlist_id": playlist_id})
    return {
        "message": f"No songs to expire for user {user_id} and playlist {playlist_id}"
    }
