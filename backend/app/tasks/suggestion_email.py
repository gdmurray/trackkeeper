from datetime import datetime, timedelta, timezone

from pydantic import BaseModel
from app.core.celery_app import celery_app
from app.core.security import create_unsubscribe_token
from app.db.supabase import supabase
from app.models.spotify_access import SpotifyAccess
from app.services.email_sender import EmailSender
from app.services.spotify_service import SpotifyService
from app.models.cached_tracks import CachedTrack
from app.core.config import settings
from app.core.logging import setup_logging

logger = setup_logging("suggestion_email")


class SuggestionEmailSong(BaseModel):
    track_id: str
    name: str
    artist: str
    removed_at: datetime
    playlist_name: str
    accident: bool = False


@celery_app.task
def send_suggestion_email(user_id: str):
    """
    This Function takes user_id, and sends an email with suggestions for accidentally removed songs
    """
    # Write a query to get all items from
    # Get the date one week ago
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    # Query to get deleted songs for the user in the last week from liked songs
    deleted_songs_query = supabase.table('Deleted Songs')\
        .select('*, playlist:"Tracked Playlists"(liked_songs, playlist_name), track:"Cached Tracks"(*)') \
        .eq('user_id', user_id) \
        .gte('removed_at', one_week_ago.isoformat()) \
        .execute()
    # .eq('playlist.liked_songs', True) \

    if not deleted_songs_query.data:
        logger.warning(f"No deleted songs found for user {user_id} in the last week.", extra={
                       "user_id": user_id})
        return

    deleted_songs_map = {song['track_id']                         : song for song in deleted_songs_query.data}

    # These songs can't be removed by accident
    excluded_playlists = ['On Repeat', 'Release Radar']
    songs_to_check = [CachedTrack(
        **song['track']) for song in deleted_songs_query.data if song['playlist']['playlist_name'] not in excluded_playlists]

    deleted_songs = [CachedTrack(
        **song['track']
    ) for song in deleted_songs_query.data]
    # print("Deleted Songs: ", deleted_songs)

    if songs_to_check and len(songs_to_check) > 0:
        spotify_access_result = supabase.table('Spotify Access').select(
            '*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
        if not spotify_access_result or not spotify_access_result.data:
            logger.error(f"Error fetching Spotify access for user {user_id}", extra={
                         "user_id": user_id, "spotify_access_result": spotify_access_result})
            raise Exception(
                f"Error fetching Spotify access for user {user_id}")

        spotify_access: SpotifyAccess = SpotifyAccess(
            **spotify_access_result.data[0])
        spotify_service = SpotifyService(spotify_access)

        suggest_song_ids = [song.track_id for song in songs_to_check]
        suggestions = spotify_service.suggest_accidentally_removed_tracks(
            suggest_song_ids)
        logger.info(f"Accidentally Removed Suggestions", extra={
                    "user_id": user_id, "suggestions": suggestions})

        # Create final list starting with suggestions if they exist
    final_songs: list[SuggestionEmailSong] = []
    suggestion_track_ids = set()

    # Add suggestions first if they exist
    if suggestions and len(suggestions) > 0:
        for suggestion in suggestions:
            final_songs.append(
                SuggestionEmailSong(
                    track_id=suggestion.track_id,
                    name=suggestion.name,
                    artist=suggestion.artist,
                    removed_at=deleted_songs_map[suggestion.track_id]['removed_at'],
                    playlist_name=deleted_songs_map[suggestion.track_id]['playlist']['playlist_name'],
                    accident=True)
            )
            suggestion_track_ids.add(suggestion.track_id)

    # Add remaining deleted songs that aren't already in suggestions
    not_in_suggested_tracks = [SuggestionEmailSong(
        track_id=deleted_song.track_id,
        name=deleted_song.name,
        artist=deleted_song.artist,
        removed_at=deleted_songs_map[deleted_song.track_id]['removed_at'],
        playlist_name=deleted_songs_map[deleted_song.track_id]['playlist']['playlist_name'],
        accident=False
    ) for deleted_song in deleted_songs if deleted_song.track_id not in suggestion_track_ids]

    not_in_suggested_tracks.sort(key=lambda x: (
        0 if x.playlist_name == 'Liked Songs' else 1,
        x.removed_at
    ))

    final_songs.extend(not_in_suggested_tracks)

    # Truncate to max 10 songs
    final_songs = final_songs[:10]

    if final_songs and len(final_songs) > 0:
        # Get User
        user_response = supabase.auth.admin.get_user_by_id(user_id)
        if not user_response or not user_response.user:
            logger.error(f"Error fetching user {user_id}", extra={
                         "user_id": user_id, "user_response": user_response})
            raise Exception(f"Error fetching user {user_id}")

        user = user_response.user

        email_sender = EmailSender()
        email_sender.send_email(
            template_name="deleted_songs",
            to_email=user.email,
            subject="Recently Removed from Spotify",
            context={
                'songs': [{
                    **song.model_dump(),
                    'removed_at': song.removed_at.strftime("%B %d, %Y")
                } for song in final_songs],
                'user_id': user_id,
                'preheader_text': "Here are your recently removed songs from Spotify"
            }
        )
