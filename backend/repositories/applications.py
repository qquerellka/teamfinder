# backend/repositories/applications.py
from __future__ import annotations

from typing import Optional, List

from sqlalchemy import select, update, delete, func

from backend.repositories.base import BaseRepository
from backend.persistend.models import application as m_app
from backend.persistend.models import users as m_users


class ApplicationsRepo(BaseRepository):
    """
    Репозиторий для таблицы `application`.
    Работает с БД через краткоживущие async-сессии (per-operation).
    """

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, app_id: int) -> Optional[m_app.Application]:
        """Получить анкету по первичному ключу."""
        async with self._sm() as s:
            return await s.get(m_app.Application, app_id)

    async def get_by_user_and_hackathon(
        self,
        *,
        user_id: int,
        hackathon_id: int,
    ) -> Optional[m_app.Application]:
        """Анкета конкретного пользователя на конкретном хакатоне."""
        A = m_app.Application
        async with self._sm() as s:
            stmt = (
                select(A)
                .where(A.user_id == user_id)
                .where(A.hackathon_id == hackathon_id)
                .limit(1)
            )
            res = await s.execute(stmt)
            return res.scalars().first()

    async def search(
        self,
        *,
        hackathon_id: int,
        role: Optional[str],
        q: Optional[str],
        limit: int,
        offset: int,
    ) -> List[m_app.Application]:
        """
        Список анкет одного хакатона с фильтрами и пагинацией.
        Фильтры: role, текстовый поиск по username/first_name/last_name.
        """
        A = m_app.Application
        U = m_users.User

        async with self._sm() as s:
            stmt = (
                select(A)
                .join(U, U.id == A.user_id)
                .where(A.hackathon_id == hackathon_id)
            )

            if role:
                stmt = stmt.where(A.role == role)

            if q:
                q_like = f"%{q}%"
                username_ilike = func.lower(func.coalesce(U.username, "")).like(
                    func.lower(q_like)
                )
                fn_ilike = U.first_name.ilike(q_like)
                ln_ilike = U.last_name.ilike(q_like)
                stmt = stmt.where(username_ilike | fn_ilike | ln_ilike)

            stmt = stmt.order_by(A.updated_at.desc()).limit(limit).offset(offset)
            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def search_by_user(
        self,
        *,
        user_id: int,
        limit: int,
        offset: int,
    ) -> List[m_app.Application]:
        """Все анкеты пользователя по всем хакатонам."""
        A = m_app.Application

        async with self._sm() as s:
            stmt = (
                select(A)
                .where(A.user_id == user_id)
                .order_by(A.updated_at.desc())
                .limit(limit)
                .offset(offset)
            )
            res = await s.execute(stmt)
            return list(res.scalars().all())

    # ---------- ЗАПИСЬ ----------

    async def create(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: Optional[str],
        skills: Optional[list[str]],  # пока не используется (MVP)
    ) -> m_app.Application:
        """Создать анкету."""
        A = m_app.Application

        async with self._sm() as s:
            obj = A(
                user_id=user_id,
                hackathon_id=hackathon_id,
                role=role,
            )
            s.add(obj)
            await s.commit()
            await s.refresh(obj)
            return obj

    # ---------- ОБНОВЛЕНИЕ ----------

    async def update(self, app_id: int, data: dict) -> Optional[m_app.Application]:
        """Частичное обновление анкеты по id."""
        A = m_app.Application

        async with self._sm() as s:
            stmt = (
                update(A)
                .where(A.id == app_id)
                .values(**data)
                .execution_options(synchronize_session="fetch")
            )
            res = await s.execute(stmt)
            await s.commit()

            if res.rowcount == 0:
                return None

            return await s.get(A, app_id)

    # ---------- УДАЛЕНИЕ ----------

    async def delete(self, app_id: int) -> bool:
        """Удалить анкету по id. True, если что-то удалили."""
        A = m_app.Application

        async with self._sm() as s:
            stmt = delete(A).where(A.id == app_id)
            res = await s.execute(stmt)
            await s.commit()
            return res.rowcount > 0
