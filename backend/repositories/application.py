# =============================================================================
# ФАЙЛ: backend/repositories/applications.py
# КРАТКО: Репозиторий для работы с анкетами пользователей (Application).
# ЗАЧЕМ:
#   • Инкапсулирует доступ к БД: создание анкеты, поиск с фильтрами, обновление, удаление.
#   • Реализует фильтры по роли и q (username/first_name/last_name) через JOIN на users.
# ОСОБЕННОСТИ:
#   • Асинхронные сессии per-operation (через BaseRepository._sm()).
#   • Возвращает ORM-модели (Application), сериализация — в роутере.
# =============================================================================

from __future__ import annotations

from typing import Optional, List

from sqlalchemy import select, update, delete, func
from backend.repositories.base import BaseRepository

from backend.persistend.models import application as m_app
from backend.persistend.models import users as m_users


class ApplicationsRepo(BaseRepository):
    """Работа с таблицей application."""

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, app_id: int) -> Optional[m_app.Application]:
        async with self._sm() as s:
            return await s.get(m_app.Application, app_id)

    async def get_by_user_and_hackathon(self, *, user_id: int, hackathon_id: int) -> Optional[m_app.Application]:
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
        Список анкет одного хакатона с фильтрами:
          • role == <role> (если задана)
          • q    — ILIKE-поиск по users.username/first_name/last_name
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
                username_ilike = func.lower(func.coalesce(U.username, "")).like(func.lower(q_like))
                fn_ilike = U.first_name.ilike(q_like)
                ln_ilike = U.last_name.ilike(q_like)
                stmt = stmt.where(username_ilike | fn_ilike | ln_ilike)

            stmt = stmt.order_by(A.updated_at.desc()).limit(limit).offset(offset)

            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def search_by_user(self, *, user_id: int, limit: int, offset: int) -> List[m_app.Application]:
        """Все анкеты конкретного пользователя по всем хакатонам."""
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
        title: Optional[str],
        about: Optional[str],
        city: Optional[str],
        skills: Optional[list[str]],  # сейчас не сохраняем (MVP), оставлено для сигнатуры совместимости
    ) -> m_app.Application:
        A = m_app.Application
        async with self._sm() as s:
            obj = A(
                user_id=user_id,
                hackathon_id=hackathon_id,
                role=role,        # Enum колонка примет строку (SQLAlchemy приведёт)
                # статус/joined выставятся дефолтами модели/БД
            )
            # Доп. опциональные поля, если они есть в модели
            if hasattr(A, "title"):
                obj.title = title
            if hasattr(A, "about"):
                obj.about = about
            if hasattr(A, "city"):
                obj.city = city

            s.add(obj)
            await s.commit()
            await s.refresh(obj)
            return obj

    # ---------- ОБНОВЛЕНИЕ ----------

    async def update(self, app_id: int, data: dict) -> Optional[m_app.Application]:
        """
        Частичное обновление анкеты:
          • ожидает dict с изменяемыми полями (role/status/title/about/city/…)
        """
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
        A = m_app.Application
        async with self._sm() as s:
            stmt = delete(A).where(A.id == app_id)
            res = await s.execute(stmt)
            await s.commit()
            return res.rowcount > 0
