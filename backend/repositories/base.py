from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from backend.infrastructure.db import get_sessionmaker


class BaseRepository:
    """
    Базовый класс для репозиториев.

    Хранит фабрику асинхронных сессий. По умолчанию использует
    глобальный `get_sessionmaker()`, но в тестах можно передать
    свою фабрику через аргумент `sm`.
    """

    def __init__(self, sm: async_sessionmaker[AsyncSession] | None = None) -> None:
        self._sm: async_sessionmaker[AsyncSession] = sm or get_sessionmaker()
