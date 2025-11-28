# =============================================================================
# ФАЙЛ: backend/repositories/responses.py
# КРАТКО: репозиторий для Response.
# =============================================================================

from __future__ import annotations
from typing import Optional, List

from sqlalchemy import select, func

from backend.repositories.base import BaseRepository
from backend.persistend.enums import ResponseStatus, RoleType
from backend.persistend.models.response import Response
from backend.persistend.models.application import Application


class ResponsesRepo(BaseRepository):
    async def get_by_id(self, response_id: int) -> Optional[Response]:
        async with self._sm() as s:
            return await s.get(Response, response_id)

    async def list_for_vacancy(self, vacancy_id: int) -> List[Response]:
        R = Response
        async with self._sm() as s:
            stmt = (
                select(R)
                .where(R.vacancy_id == vacancy_id)
                .order_by(R.created_at.desc())
            )
            res = await s.execute(stmt)
            return res.scalars().all()

    async def list_for_user(
        self, user_id: int, limit: int, offset: int
    ) -> List[Response]:
        R = Response
        A = Application
        async with self._sm() as s:
            stmt = (
                select(R)
                .join(A, A.id == R.application_id)
                .where(A.user_id == user_id)
                .order_by(R.created_at.desc())
                .offset(offset)
                .limit(limit)
            )
            res = await s.execute(stmt)
            return res.scalars().all()

    async def count_active_for_application(self, application_id: int) -> int:
        R = Response
        async with self._sm() as s:
            stmt = (
                select(func.count())
                .select_from(R)
                .where(R.application_id == application_id)
                .where(R.status == ResponseStatus.pending)
            )
            res = await s.execute(stmt)
            return int(res.scalar_one())

    async def create(
        self,
        *,
        vacancy_id: int,
        application_id: int,
        desired_role: RoleType,
    ) -> Response:
        async with self._sm() as s:
            obj = Response(
                vacancy_id=vacancy_id,
                application_id=application_id,
                desired_role=desired_role,
                status=ResponseStatus.pending,
            )
            s.add(obj)
            await s.commit()
            await s.refresh(obj)
            return obj

    async def update_status(
        self, response_id: int, status: ResponseStatus
    ) -> Optional[Response]:
        async with self._sm() as s:
            obj = await s.get(Response, response_id)
            if not obj:
                return None
            obj.status = status
            await s.commit()
            await s.refresh(obj)
            return obj

    async def get_by_vacancy_and_application(
        self,
        *,
        vacancy_id: int,
        application_id: int,
    ) -> Optional[Response]:
        R = Response
        async with self._sm() as s:
            stmt = (
                select(R)
                .where(
                    (R.vacancy_id == vacancy_id) & (R.application_id == application_id)
                )
                .limit(1)
            )
            res = await s.execute(stmt)
            return res.scalars().first()
