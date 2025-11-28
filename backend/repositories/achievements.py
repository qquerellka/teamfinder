from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import List, Optional, Tuple

from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from backend.repositories.base import BaseRepository
from backend.persistend.enums import AchievementPlace, RoleType
from backend.persistend.models import achievement as m_ach

# Лок на пару (user_id, hackathon_id), чтобы защититься от гонок при создании записи
_key_locks: dict[tuple[int, int], asyncio.Lock] = defaultdict(asyncio.Lock)


class AchievementsRepo(BaseRepository):
    """Репозиторий достижений. Сессии создаются per-operation через self._sm()."""

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, ach_id: int) -> Optional[m_ach.Achievement]:
        """Получить достижение по PK."""
        async with self._sm() as s:
            return await s.get(m_ach.Achievement, ach_id)

    async def list_by_user(
        self,
        user_id: int,
        *,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
        limit: int = 50,
        offset: int = 0,
        with_hackathon: bool = False,
    ) -> Tuple[List[m_ach.Achievement], int]:
        """
        Список достижений пользователя с опциональными фильтрами.
        Возвращает (items, total). Сортировка по created_at DESC.
        """
        a = m_ach.Achievement
        stmt = select(a).where(a.user_id == user_id)

        if role is not None:
            stmt = stmt.where(a.role == role)
        if place is not None:
            stmt = stmt.where(a.place == place)

        if with_hackathon:
            stmt = stmt.options(joinedload(a.hackathon))

        stmt = stmt.order_by(a.created_at.desc())

        async with self._sm() as s:
            total = (
                await s.execute(
                    select(func.count()).select_from(stmt.subquery())
                )
            ).scalar_one()
            res = await s.execute(stmt.limit(limit).offset(offset))
            return list(res.scalars().all()), total

    async def list_by_hackathon(
        self,
        hackathon_id: int,
        *,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
        limit: int = 50,
        offset: int = 0,
        with_user: bool = False,
    ) -> Tuple[List[m_ach.Achievement], int]:
        """
        Список достижений по хакатону с опциональными фильтрами.
        Возвращает (items, total). Сортировка по created_at DESC.
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
            total = (
                await s.execute(
                    select(func.count()).select_from(stmt.subquery())
                )
            ).scalar_one()
            res = await s.execute(stmt.limit(limit).offset(offset))
            return list(res.scalars().all()), total

    # ---------- СОЗДАНИЕ / UPSERT ----------

    async def _exists_for_user_hack(self, user_id: int, hackathon_id: int) -> bool:
        a = m_ach.Achievement
        async with self._sm() as s:
            stmt = (
                select(func.count())
                .select_from(a)
                .where(
                    (a.user_id == user_id)
                    & (a.hackathon_id == hackathon_id)
                )
            )
            return (await s.execute(stmt)).scalar_one() > 0

    async def create(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: RoleType,
        place: AchievementPlace = AchievementPlace.participant,
    ) -> m_ach.Achievement:
        """
        Создать достижение, если для (user_id, hackathon_id) его ещё нет.
        Иначе -> ValueError('duplicate_achievement').
        """
        key = (user_id, hackathon_id)

        async with _key_locks[key]:
            if await self._exists_for_user_hack(user_id, hackathon_id):
                raise ValueError("duplicate_achievement")

            async with self._sm() as s:
                ach = m_ach.Achievement(
                    user_id=user_id,
                    hackathon_id=hackathon_id,
                    role=role,
                    place=place,
                )
                s.add(ach)
                await s.commit()
                await s.refresh(ach)
                return ach

    async def upsert_for_user_hack(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
    ) -> m_ach.Achievement:
        """
        Идемпотентная операция «одно достижение на (user_id, hackathon_id)».

        Если запись есть — обновляем переданные поля (role/place).
        Если нет — создаём новую (роль/место должны быть заданы хотя бы одно).
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
                ach = m_ach.Achievement(
                    user_id=user_id,
                    hackathon_id=hackathon_id,
                    role=role if role is not None else RoleType.Analytics,
                    place=(
                        place
                        if place is not None
                        else AchievementPlace.participant
                    ),
                )
                s.add(ach)
            else:
                if role is not None:
                    ach.role = role
                if place is not None:
                    ach.place = place

            try:
                await s.commit()
            except IntegrityError as e:
                await s.rollback()
                raise ValueError(
                    f"integrity_error:{e.__class__.__name__}"
                ) from e

            await s.refresh(ach)
            return ach

    # ---------- ОБНОВЛЕНИЕ / УДАЛЕНИЕ ----------

    async def update(
        self,
        ach_id: int,
        *,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
    ) -> Optional[m_ach.Achievement]:
        """
        Обновить роль/место достижения по id.
        Возвращает обновлённый объект или None.
        """
        if role is None and place is None:
            return await self.get_by_id(ach_id)

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

    async def delete_by_id(self, ach_id: int) -> bool:
        """Удалить достижение по id. Возвращает True, если что-то удалили."""
        async with self._sm() as s:
            res = await s.execute(
                delete(m_ach.Achievement).where(m_ach.Achievement.id == ach_id)
            )
            await s.commit()
            return bool(res.rowcount)

    async def delete_for_user_in_hack(
        self,
        user_id: int,
        hackathon_id: int,
    ) -> int:
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

    # ---------- АГРЕГАТЫ ----------

    async def stats_by_place_for_hack(
        self,
        hackathon_id: int,
    ) -> List[tuple[AchievementPlace, int]]:
        """
        Распределение достижений по place в рамках хакатона.
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
