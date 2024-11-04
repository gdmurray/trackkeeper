from datetime import datetime, timedelta, timezone
from math import ceil
import typing_extensions
from typing import List

from app.core.celery_app import celery_app
from app.db.supabase import supabase
from app.tasks.take_snapshot import take_snapshot
from app.tasks.suggestion_email import send_suggestion_email
from app.core.logging import setup_logging

logger = setup_logging("cron_tasks")


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

    logger.info("Queueing user tasks")
    # Fetch all user settings and tracked playlists in one query
    user_settings = supabase.table('User Settings').select(
        'user_id').eq('snapshots_enabled', True).execute()
    tracked_playlists = supabase.table('Tracked Playlists').select(
        'id, user_id, playlist_id, playlist_name').eq('active', True).execute()

    if not user_settings or not user_settings.data:
        logger.error("Error Fetching User Settings. Task ended.",
                     extra={"user_settings": user_settings})

    if not tracked_playlists or not tracked_playlists.data:
        logger.error("Error Fetching Tracked Playlists. Task ended.",
                     extra={"tracked_playlists": tracked_playlists})
        return

    # Create a dictionary of user settings for quick lookup
    active_users: List[str] = [setting['user_id']
                               for setting in user_settings.data]

    # Create a dictionary of tracked playlists for each user
    user_playlists: dict[str, List[TrackedPlaylist]] = {}
    for playlist in tracked_playlists.data:
        user_playlists.setdefault(playlist['user_id'], []).append(playlist)

    total_users = len(active_users)

    logger.info("Total users", extra={"total_users": total_users})

    num_subsets = ceil(total_users / MAX_USERS_PER_SUBSET)

    # Ensure we don't exceed the execution window
    if num_subsets * SUBSET_WINDOW > EXECUTION_WINDOW:
        num_subsets = EXECUTION_WINDOW // SUBSET_WINDOW
        MAX_USERS_PER_SUBSET = ceil(total_users / num_subsets)

    logger.info("Number of subsets", extra={"num_subsets": num_subsets})
    logger.info("Users per subset", extra={
                "MAX_USERS_PER_SUBSET": MAX_USERS_PER_SUBSET})

    start_time = datetime.now(timezone.utc)
    for i in range(num_subsets):
        subset_start = i * MAX_USERS_PER_SUBSET
        subset_end = min((i + 1) * MAX_USERS_PER_SUBSET, total_users)
        subset_users: List[str] = active_users[subset_start:subset_end]

        logger.info("Subset", extra={"subset_users": subset_users})
        for user_id in subset_users:
            # Calculate delay for this task
            delay = i * SUBSET_WINDOW.total_seconds()

            for playlist in user_playlists.get(user_id):
                # Pass in Supabase id, spotify id, and spotify name
                take_snapshot.apply_async(
                    args=[user_id, playlist['id'], playlist['playlist_id'], playlist['playlist_name']], countdown=delay)

        logger.info("Queued subset", extra={
                    "subset_number": i+1, "num_subsets": num_subsets, "subset_users": subset_users})

    end_time = start_time + \
        timedelta(seconds=(num_subsets - 1) * SUBSET_WINDOW.total_seconds())
    logger.info("Queued tasks", extra={
                "total_users": total_users, "start_time": start_time, "end_time": end_time})
    return f"Queued tasks for {total_users} users. Execution will be from {start_time} to {end_time}"


@celery_app.task
def weekly_suggestions():
    user_settings = supabase.table('User Settings').select(
        'user_id, suggestion_emails').eq('suggestion_emails', True).execute()
    if not user_settings or not user_settings.data:
        logger.error("Error Fetching User Settings. Task ended.",
                     extra={"user_settings": user_settings})
        raise Exception("Error Fetching User Settings. Task ended.")

    active_users = [setting['user_id'] for setting in user_settings.data]

    for user_id in active_users:
        send_suggestion_email.apply_async(args=[user_id])
