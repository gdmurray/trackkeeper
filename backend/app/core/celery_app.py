from celery import Celery
from app.core.config import settings

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
    # "update-spotify-data-every-minute": {
    #     "task": "app.tasks.cron_tasks.queue_user_tasks",
    #     "schedule": 60.0, #43200.0,
    # }
}

