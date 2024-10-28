from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Recently Removed from Spotify"
    SPOTIFY_CLIENT_ID: str
    SPOTIFY_CLIENT_SECRET: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str
    REDIS_URL: str = "redis://redis:6379/0"
    FLOWER_USER: str = "flower"
    FLOWER_PASSWORD: str = "flower"

    model_config = SettingsConfigDict(env_file="../../.env")

settings = Settings()
