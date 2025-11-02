# src/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    telegram_bot_token: str | None = None
    database_url: str

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False

settings = Settings()
