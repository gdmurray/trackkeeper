from celery import Celery
from app.core.config import settings
from celery.schedules import crontab
celery_app = Celery("app")
# celery_app.config_from_object('app.core.celery_config')
celery_app.autodiscover_tasks(['app.tasks'])
celery_app.conf.broker_url = settings.REDIS_URL
celery_app.conf.result_backend = settings.REDIS_URL
celery_app.conf.task_serializer = 'json'
celery_app.conf.result_serializer = 'json'
celery_app.conf.accept_content = ['json']
celery_app.conf.timezone = 'UTC'

celery_app.conf.task_routes = {
    "app.tasks.cron_tasks.*": {"queue": "cron_tasks"},
    "app.tasks.*": {"queue": "default"},
}

celery_app.conf.beat_schedule = {
    "update-spotify-data-every-12-hours": {
        "task": "app.tasks.cron_tasks.queue_user_tasks",
        "schedule": crontab(minute=0, hour='0,12'),
    },
    "weekly-suggestions-friday-9am": {
        "task": "app.tasks.cron_tasks.weekly_suggestions",
        "schedule": crontab(minute=0, hour=9, day_of_week=5),
    }
}

