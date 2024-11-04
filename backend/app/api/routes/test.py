from fastapi import APIRouter

from app.tasks.cron_tasks import queue_user_tasks, weekly_suggestions
from app.db.supabase import supabase
from app.tasks.check_song_expiry import check_song_expiry
from app.tasks.suggestion_email import send_suggestion_email
from app.core.config import settings

router = APIRouter(prefix="/test", tags=["test"])

@router.get("/")
async def test():
    return {"message": "Hello, World!"}

@router.get("/queue_user_tasks")
async def test_queue_user_tasks():
    task = queue_user_tasks.delay()
    return {"message": "Task queued", "task_id": task.id}

@router.get("/weekly_suggestions")
async def test_weekly_suggestions():
    task = weekly_suggestions.delay()
    return {"message": "Task queued", "task_id": task.id}

@router.get("/send_suggestion_email")
async def test_send_suggestion_email():
    print("TEST_USER_ID: ", settings.TEST_USER_ID)
    user_response = supabase.auth.admin.get_user_by_id(settings.TEST_USER_ID)
    user = user_response.user
    print("User: ", user)
    task = send_suggestion_email.delay(user.id)
    print("Task: ", task)
    return {"message": "Task queued", "task_id": task.id}

@router.get("/check_song_expiry")
async def test_check_song_expiry():
    user_response = supabase.auth.admin.get_user_by_id(settings.TEST_USER_ID)
    user = user_response.user
    playlists = supabase.table('Tracked Playlists').select('*').eq('user_id', user.id).execute()

    task_ids = []
    for playlist in playlists:
        task = check_song_expiry.delay(user.id, playlist.id)
        task_ids.append(task.id)
    return {"message": "Tasks queued", "task_ids": task_ids}