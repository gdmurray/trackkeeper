from app.core.config import settings

broker_url = settings.REDIS_URL
result_backend = settings.REDIS_URL

task_serializer = 'json'
result_serializer = 'json'
accept_content = ['json']
timezone = 'UTC'

task_routes = {
    "app.tasks.cron_tasks.*": {"queue": "cron_tasks"},
    "app.tasks.*": {"queue": "default"},
}

beat_schedule = {
    "update-spotify-data-every-minute": {
        "task": "app.tasks.cron_tasks.queue_user_tasks",
        "schedule": 60.0,
    }
}
