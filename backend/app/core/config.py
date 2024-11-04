from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_URL: str = "https://api.trackkeeper.app"
    FRONTEND_URL: str = "https://trackkeeper.app"
    PROJECT_NAME: str = "TrackKeeper"
    SPOTIFY_CLIENT_ID: str
    SPOTIFY_CLIENT_SECRET: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str
    RESEND_API_KEY: str
    REDIS_URL: str = "redis://redis:6379/0"
    FLOWER_USER: str = "flower"
    FLOWER_PASSWORD: str = "flower"
    ENV: str = "development"
    TEST_USER_ID: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    DEFAULT_FROM_EMAIL: str = "no-reply@trackkeeper.app"

    model_config = SettingsConfigDict(env_file="../../.env")


settings = Settings()
