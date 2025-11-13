# =============================================================================
# ФАЙЛ: backend/repositories/achievements.py
# КРАТКО: Репозиторий для работы с достижениями пользователей по хакатонам.
# ЗАЧЕМ:
#   • Инкапсулирует логику взаимодействия с БД для таблицы achievements.
#   • Даёт простые методы CRUD и выборки с фильтрами и пагинацией.
#   • Поддерживает удобные выборки: по user_id и по hackathon_id.
# =============================================================================

from __future__ import annotations

from typing import Optional, Tuple, List

from sqlalchemy import select, func, delete, insert  # при обновлении полей используем ORM-объект + commit
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from collections import defaultdict
import asyncio

from backend.repositories.base import BaseRepository
from backend.persistend.models import achievement as m_ach
from backend.persistend.models import users as m_users
from backend.persistend.models import hackathons as m_hack

_key_locks: dict[tuple[int, int], asyncio.Lock] = defaultdict(asyncio.Lock)

class AchievementsRepo(BaseRepository):
    """Репозиторий достижений. Сессии создаются per-operation."""

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, ach_id: int) -> Optional[m_ach.Achievement]:
        """Получить достижение по PK."""
        async with self._sm() as s:
            return await s.get(m_ach.Achievement, ach_id)

    async def list_by_user(
        self,
        user_id: int,
        *,
        role: Optional[m_ach.RoleType] = None,
        place: Optional[m_ach.AchievPlace] = None,
        limit: int = 50,
        offset: int = 0,
        with_hackathon: bool = False,
    ) -> Tuple[List[m_ach.Achievement], int]:
        """
        Список достижений пользователя с опциональными фильтрами.
        Возвращает (items, total). По умолчанию сортируем по created_at DESC.
        """
        a = m_ach.Achievement
        stmt = select(a).where(a.user_id == user_id)

        if role is not None:
            stmt = stmt.where(a.role == role)
        if place is not None:
            stmt = stmt.where(a.place == place)

        if with_hackathon:
            # Подтянем хакатон, чтобы избежать N+1 при обращении a.hackathon
            stmt = stmt.options(joinedload(a.hackathon))

        stmt = stmt.order_by(a.created_at.desc())

        async with self._sm() as s:
            total = (await s.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
            res = await s.execute(stmt.limit(limit).offset(offset))
            return list(res.scalars().all()), total

    async def list_by_hackathon(
        self,
        hackathon_id: int,
        *,
        role: Optional[m_ach.RoleType] = None,
        place: Optional[m_ach.AchievPlace] = None,
        limit: int = 50,
        offset: int = 0,
        with_user: bool = False,
    ) -> Tuple[List[m_ach.Achievement], int]:
        """
        Список достижений по хакатону с опциональными фильтрами.
        Возвращает (items, total). По умолчанию сортируем по created_at DESC.
        """
        a = m_ach.Achievement
        stmt = select(a).where(a.hackathon_id == hackathon_id)

        if role is not None:
            stmt = stmt.where(a.role == role)
        if place is not None:
            stmt = stmt.where(a.place == place)

        if with_user:
            stmt = stmt.options(joinedload(a.user))

        stmt = stmt.order_by(a.created_at.desc())

        async with self._sm() as s:
            total = (await s.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
            res = await s.execute(stmt.limit(limit).offset(offset))
            return list(res.scalars().all()), total

    # ---------- СОЗДАНИЕ ----------
    async def _exists_for_user_hack(self, user_id: int, hackathon_id: int) -> bool:
        a = m_ach.Achievement
        async with self._sm() as s:
            stmt = (
                select(func.count())
                .select_from(a)
                .where((a.user_id == user_id) & (a.hackathon_id == hackathon_id))
            )
            return (await s.execute(stmt)).scalar_one() > 0

    async def create(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: m_ach.RoleType,
        place: m_ach.AchievPlace = m_ach.AchievPlace.participant,
    ) -> m_ach.Achievement:
        """
        Создать достижение, если для (user_id, hack_id) его ещё нет.
        Иначе -> ValueError('duplicate_achievement').
        """
        key = (user_id, hackathon_id)
        async with _key_locks[key]:  # защищаем от гонок в одном процессе
            if await self._exists_for_user_hack(user_id, hackathon_id):
                raise ValueError("duplicate_achievement")

            async with self._sm() as s:
                ach = m_ach.Achievement(user_id=user_id, hackathon_id=hackathon_id, role=role, place=place)
                s.add(ach)
                await s.commit()
                await s.refresh(ach)
                return ach

    async def upsert_for_user_hack(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: Optional[m_ach.RoleType] = None,
        place: Optional[m_ach.AchievPlace] = None,
    ) -> m_ach.Achievement:
        """
        Идемпотентная операция «одно достижение на пару (user_id, hack_id)».
        Если запись уже есть — обновляем переданные поля (role/place).
        Если нет — создаём новую (role и/или place должны быть заданы).
        Подходит, если в продуктовой логике вы хотите не множить записи.
        """
        if role is None and place is None:
            raise ValueError("invalid_args:role_or_place_required")

        async with self._sm() as s:
            res = await s.execute(
                select(m_ach.Achievement)
                .where(
                    (m_ach.Achievement.user_id == user_id)
                    & (m_ach.Achievement.hackathon_id == hackathon_id)
                )
                .order_by(m_ach.Achievement.created_at.desc())
                .limit(1)
            )
            ach = res.scalars().first()

            if ach is None:
                # создаём
                ach = m_ach.Achievement(
                    user_id=user_id,
                    hackathon_id=hackathon_id,
                    role=role if role is not None else m_ach.RoleType.Analytics,  # дефолт — на ваш вкус
                    place=place if place is not None else m_ach.AchievPlace.participant,
                )
                s.add(ach)
            else:
                # обновляем только переданные поля
                if role is not None:
                    ach.role = role
                if place is not None:
                    ach.place = place

            try:
                await s.commit()
            except IntegrityError as e:
                await s.rollback()
                raise ValueError(f"integrity_error:{e.__class__.__name__}") from e

            await s.refresh(ach)
            return ach

    # ---------- ОБНОВЛЕНИЕ ----------

    async def update(
        self,
        ach_id: int,
        *,
        role: Optional[m_ach.RoleType] = None,
        place: Optional[m_ach.AchievPlace] = None,
    ) -> Optional[m_ach.Achievement]:
        """
        Обновить роль/место достижения по id. Возвращает обновлённый объект или None.
        """
        if role is None and place is None:
            return await self.get_by_id(ach_id)  # нечего менять

        async with self._sm() as s:
            ach = await s.get(m_ach.Achievement, ach_id)
            if not ach:
                return None
            if role is not None:
                ach.role = role
            if place is not None:
                ach.place = place
            await s.commit()
            await s.refresh(ach)
            return ach

    # ---------- УДАЛЕНИЕ ----------

    async def delete_by_id(self, ach_id: int) -> bool:
        """Удалить достижение по id. Возвращает True, если что-то удалили."""
        async with self._sm() as s:
            res = await s.execute(
                delete(m_ach.Achievement).where(m_ach.Achievement.id == ach_id)
            )
            await s.commit()
            return res.rowcount > 0

    async def delete_for_user_in_hack(self, user_id: int, hackathon_id: int) -> int:
        """
        Удалить все достижения пользователя в конкретном хакатоне.
        Возвращает количество удалённых строк.
        """
        async with self._sm() as s:
            res = await s.execute(
                delete(m_ach.Achievement).where(
                    (m_ach.Achievement.user_id == user_id)
                    & (m_ach.Achievement.hackathon_id == hackathon_id)
                )
            )
            await s.commit()
            return int(res.rowcount or 0)

    # ---------- АГРЕГАЦИИ (пример) ----------

    async def stats_by_place_for_hack(self, hackathon_id: int) -> List[tuple[m_ach.AchievPlace, int]]:
        """
        Пример агрегата: распределение достижений по 'place' в рамках хакатона.
        """
        a = m_ach.Achievement
        async with self._sm() as s:
            res = await s.execute(
                select(a.place, func.count())
                .where(a.hackathon_id == hackathon_id)
                .group_by(a.place)
                .order_by(func.count().desc())
            )
            return [(place, int(cnt)) for place, cnt in res.all()]
