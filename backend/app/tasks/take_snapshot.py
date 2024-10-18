from app.core.celery_app import celery_app
from app.db.supabase import supabase
from datetime import datetime, timezone
from app.services.spotify_service import spotify_service

@celery_app.task
def take_user_library_snapshot(user_id):
    print("Taking user library snapshot")
    spotify_access = supabase.table('Spotify Access').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
    if spotify_access.data:
        access_token = spotify_access.data[0]['access_token']
        refresh_token = spotify_access.data[0]['refresh_token']
        # Convert the naive datetime to UTC
        expires_at = datetime.fromisoformat(spotify_access.data[0]['expires_at'].replace('Z', '+00:00')).replace(tzinfo=timezone.utc)

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
        
        liked_songs, count = spotify_service.get_user_liked_songs(access_token)

        snapshot_data = {
            'user_id': user_id,
            'song_count': count,
            'playlist_name': 'Liked Songs',
            'snapshot_data': liked_songs
        }
        result = supabase.table('Library Snapshots').insert(snapshot_data).execute()
        if result.data:
            print(f"Snapshot taken for user {user_id}")
        else:
            print(f"Failed to take snapshot for user {user_id}")
        return
    else:
        print(f"No Spotify access found for user {user_id}")

if __name__ == "__main__":
    # Test the task with a sample user ID
    sample_user_id = 'df856c98-706b-4008-8bbe-07966d383489'
    take_user_library_snapshot.delay(sample_user_id)
