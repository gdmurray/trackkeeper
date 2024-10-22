

from datetime import datetime, timedelta, timezone
from app.core.celery_app import celery_app
from app.db.supabase import supabase
from app.models.spotify_access import SpotifyAccess
from app.services.spotify_service import SpotifyService
from app.models.cached_tracks import CachedTrack
@celery_app.task
def send_suggestion_email(user_id: str):
    # Write a query to get all items from 
    # Get the date one week ago
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    # Query to get deleted songs for the user in the last week from liked songs
    deleted_songs_query = supabase.table('Deleted Songs').select('*, playlist:"Tracked Playlists"(liked_songs), track:"Cached Tracks"(*)') \
        .eq('user_id', user_id) \
        .gte('removed_at', one_week_ago.isoformat()) \
        .eq('playlist.liked_songs', True) \
        .execute()

    if not deleted_songs_query.data:
        print(f"No deleted songs found for user {user_id} in the last week.")
        return
    
    deleted_songs = [CachedTrack(
        **song['track']
    ) for song in deleted_songs_query.data]
    print("Deleted Songs: ", deleted_songs)

    spotify_access_result = supabase.table('Spotify Access').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
    if not spotify_access_result or not spotify_access_result.data:
        print(f"Error fetching Spotify access for user {user_id}")
        raise Exception(f"Error fetching Spotify access for user {user_id}")
    
    spotify_access: SpotifyAccess = SpotifyAccess(**spotify_access_result.data[0])
    print("Spotify Access: ", spotify_access)
    spotify_service = SpotifyService(spotify_access)


    deleted_song_ids = [song.track_id for song in deleted_songs]
    # deleted_song_ids.append('3dcJhWkFg7pW15v9cytbwq')
    # deleted_song_ids.append('4H8zM0MKfmrEbj2hNeTgTZ')
    # deleted_song_ids.append('1xmvq1fYLs9TEgikaFilGW')
    # deleted_song_ids.append('3xkHsmpQCBMytMJNiDf3Ii')
    # deleted_song_ids.append('5fZJQrFKWQLb7FpJXZ1g7K')
    suggestions = spotify_service.suggest_accidentally_removed_tracks(deleted_song_ids)
    print("Suggestions: ", suggestions)