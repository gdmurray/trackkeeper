from app.core.celery_app import celery_app
from app.db.supabase import supabase
from app.tasks.take_snapshot import take_user_library_snapshot

@celery_app.task
def queue_user_tasks():
    print("Queueing user tasks")
    # Fetch all users from the supabase users table
    users = supabase.auth.admin.list_users()
    print(f"Users: {users}")
    # For each user, queue a new task to take a snapshot of their data
    for user in users:
        take_user_library_snapshot.delay(user.id)

    return f"Queued tasks for {len(users)} users"
