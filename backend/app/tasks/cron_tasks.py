from datetime import datetime, timedelta, timezone
from math import ceil
import typing_extensions
from app.core.celery_app import celery_app
from app.db.supabase import supabase
from app.tasks.take_snapshot import take_snapshot
from typing import List




class TrackedPlaylist(typing_extensions.TypedDict):
    id: int
    user_id: str
    playlist_id: str
    playlist_name: str


@celery_app.task
def queue_user_tasks():
    EXECUTION_WINDOW = timedelta(hours=1)
    SUBSET_WINDOW = timedelta(minutes=5)
    MAX_USERS_PER_SUBSET = 1

    print("Queueing user tasks")
    # Fetch all user settings and tracked playlists in one query
    user_settings = supabase.table('User Settings').select('user_id').eq('snapshots_enabled', True).execute()
    tracked_playlists = supabase.table('Tracked Playlists').select('id, user_id, playlist_id, playlist_name').eq('active', True).execute()

    if not user_settings or not user_settings.data:
        print("Error Fetching User Settings. Task ended.")
    
    if not tracked_playlists or not tracked_playlists.data:
        print("Error Fetching Tracked Playlists. Task ended.")
        return
    
    # Create a dictionary of user settings for quick lookup
    active_users: List[str] = [setting['user_id'] for setting in user_settings.data]

    # Create a dictionary of tracked playlists for each user
    user_playlists: dict[str, List[TrackedPlaylist]] = {}
    for playlist in tracked_playlists.data:
        user_playlists.setdefault(playlist['user_id'], []).append(playlist)

    total_users = len(active_users)

    print(f"Total users: {total_users}")

    num_subsets = ceil(total_users / MAX_USERS_PER_SUBSET)
    
    # Ensure we don't exceed the execution window
    if num_subsets * SUBSET_WINDOW > EXECUTION_WINDOW:
        num_subsets = EXECUTION_WINDOW // SUBSET_WINDOW
        MAX_USERS_PER_SUBSET = ceil(total_users / num_subsets)

    # For each user, queue a new task to take a snapshot of their data
    print(f"Number of subsets: {num_subsets}")
    print(f"Users per subset: {MAX_USERS_PER_SUBSET}")

    start_time = datetime.now(timezone.utc)
    for i in range(num_subsets):
        subset_start = i * MAX_USERS_PER_SUBSET
        subset_end = min((i + 1) * MAX_USERS_PER_SUBSET, total_users)
        subset_users: List[str] = active_users[subset_start:subset_end]

        print(f"Subset {i+1}: {subset_users}")
        for user_id in subset_users:
            # Calculate delay for this task
            delay = i * SUBSET_WINDOW.total_seconds()

            for playlist in user_playlists.get(user_id):
                # Pass in Supabase id, spotify id, and spotify name
                take_snapshot.apply_async(args=[user_id, playlist['id'], playlist['playlist_id'], playlist['playlist_name']], countdown=delay)
        
        print(f"Queued subset {i+1}/{num_subsets} with {len(subset_users)} users")

    end_time = start_time + timedelta(seconds=(num_subsets - 1) * SUBSET_WINDOW.total_seconds())
    return f"Queued tasks for {total_users} users. Execution will be from {start_time} to {end_time}"
