from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ==== App ====
    APP_NAME: str = "MyBackend"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "dev"

    # ==== CORS ====
    CORS_ORIGINS: str = "*"

    # ==== Postgres ====
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "app_db"
    POSTGRES_USER: str = "app_user"
    POSTGRES_PASSWORD: str = "app_password"
    DATABASE_URL: Optional[str] = None

    # ==== Pool/Echo ====
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False

    # ==== Auth ====
    TELEGRAM_BOT_TOKEN: str = ""
    JWT_SECRET: str = "dev-secret-change-me"
    ADMIN_API_TOKEN: str = ""

    # ==== S3 ====
    S3_ENDPOINT: str = "https://storage.yandexcloud.net"
    S3_BUCKET: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_PUBLIC_BASE_URL: str = ""

    S3_HACKATHON_MAX_SIZE_MB: int = 5
    S3_HACKATHON_ALLOWED_TYPES: str = "image/jpeg,image/png,image/webp"

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return []
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def S3_HACKATHON_ALLOWED_TYPES_LIST(self) -> List[str]:
        raw = (self.S3_HACKATHON_ALLOWED_TYPES or "").strip()
        if not raw:
            return []
        return [t.strip() for t in raw.split(",") if t.strip()]


@lru_cache
def _get_settings() -> Settings:
    return Settings()


settings = _get_settings()
