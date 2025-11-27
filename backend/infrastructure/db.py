from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    async_sessionmaker,
    create_async_engine,
)

from backend.settings.config import settings

# Общий async-engine для приложения
engine = create_async_engine(
    settings.database_url,
    echo=getattr(settings, "DB_ECHO", False),
    pool_pre_ping=True,
    pool_size=getattr(settings, "DB_POOL_SIZE", 5),
    max_overflow=getattr(settings, "DB_MAX_OVERFLOW", 10),
)

# Фабрика асинхронных сессий
_sessionmaker: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


def get_engine() -> AsyncEngine:
    """Вернуть общий engine."""
    return engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """Вернуть фабрику сессий."""
    return _sessionmaker


async def init_db() -> None:
    """Проверить доступность БД на старте приложения."""
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))


async def dispose_db() -> None:
    """Корректно закрыть пул соединений при остановке приложения."""
    await engine.dispose()
