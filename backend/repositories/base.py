# =============================================================================
# ФАЙЛ: backend/repositories/base.py
# КРАТКО: базовый класс для репозиториев.
# ЗАЧЕМ:
#   • Хранит общую фабрику асинхронных сессий (async_sessionmaker).
#   • Даёт удобные хелперы для открытия сессии и транзакции.
# ИДЕЯ:
#   Репозитории не принимают сессию «снаружи», а сами берут её из общего sessionmaker,
#   открывая краткоживущую сессию «на операцию» (per-operation).
# =============================================================================

from __future__ import annotations  # Отложенная оценка аннотаций (удобно для типов)

from typing import AsyncContextManager  # Тип для аннотации методов, возвращающих async with-контекст
from sqlalchemy.ext.asyncio import (   # Асинхронные сущности SQLAlchemy
    AsyncSession,
    async_sessionmaker,
)
from backend.infrastructure.db import get_sessionmaker  # Глобальная фабрика сессий (singleton)

class BaseRepository:
    """База для всех репозиториев: хранит фабрику сессий (sessionmaker) и даёт хелперы."""

    def __init__(self, sm: async_sessionmaker[AsyncSession] | None = None) -> None:
        """
        Инициализация репозитория.

        sm:
          • Если передать свою фабрику — репозиторий будет использовать её (удобно для тестов).
          • Если не передавать — возьмём глобальную фабрику из инфраструктуры (get_sessionmaker()).
        """
        self._sm: async_sessionmaker[AsyncSession] = sm or get_sessionmaker()

    # # --- Хелперы для работы с сессией/транзакцией ---

    # def session(self) -> AsyncContextManager[AsyncSession]:
    #     """
    #     Открыть НОВУЮ сессию без автозапуска транзакции.
    #     Использование:
    #         async with repo.session() as session:
    #             res = await session.execute(...)
    #             await session.commit()  # если были изменения
    #     """
    #     return self._sm()  # Возвращаем async context manager: async with ... as session:

    # def transaction(self) -> AsyncContextManager[AsyncSession]:
    #     """
    #     Открыть НОВУЮ сессию и сразу начать транзакцию.
    #     Использование:
    #         async with repo.transaction() as session:
    #             session.add(...)
    #             # commit/rollback произойдёт автоматически по выходу из контекста
    #     """
    #     return self._sm.begin()  # Контекст, который выдаёт session с открытой транзакцией
