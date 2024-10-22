from fastapi import FastAPI
# from app.api.routes import spotify
from app.core.config import settings
from app.core.celery_app import celery_app
from app.tasks.cron_tasks import queue_user_tasks, weekly_suggestions

# TODO: Implement Flower UI with login + password
# TODO: Check if auth from web app transfers over to python backend
# TODO: Do I need to have a POST endpoint from my supabase instance that sets stuff up for a user
# TODO: Need an endpoint which gets invoked when a user signs up?

app = FastAPI(title=settings.PROJECT_NAME)

# app.include_router(spotify.router, prefix="/api/spotify", tags=["spotify"])

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI server"}

@app.get("/test")
async def test_queue_user_tasks():
    task = queue_user_tasks.delay()
    return {"message": "Task queued", "task_id": task.id}

@app.get("/test_suggestions")
async def test_suggestions():
    task = weekly_suggestions.delay()
    return {"message": "Task queued", "task_id": task.id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)