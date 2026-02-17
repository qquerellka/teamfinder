from __future__ import annotations

from typing import Optional, List

from sqlalchemy import select, func, update
from sqlalchemy.orm import joinedload

from repositories.base import BaseRepository
from persistent.enums import ResponseStatus
from persistent.models.response import Response
from persistent.models.vacancy import Vacancy
from persistent.models.team import Team


class ResponsesRepo(BaseRepository):
    async def get_by_id(self, response_id: int) -> Optional[Response]:
        R = Response
        async with self._sm() as s:
            # сразу подгружаем user и vacancy, чтобы _build_response_card работал без доп. запросов
            stmt = (
                select(R)
                .options(
                    joinedload(R.user),
                    joinedload(R.vacancy),
                )
                .where(R.id == response_id)
            )
            res = await s.execute(stmt)
            return res.scalar_one_or_none()

    async def list_for_vacancy(
        self,
        vacancy_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Response]:
        R = Response
        async with self._sm() as s:
            stmt = (
                select(R)
                .options(
                    joinedload(R.user),
                    joinedload(R.vacancy),
                )
                .where(R.vacancy_id == vacancy_id)
                .order_by(R.created_at.desc())
                .limit(limit)
                .offset(offset)
            )
            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def list_for_user(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Response]:
        R = Response
        async with self._sm() as s:
            stmt = (
                select(R)
                .options(
                    joinedload(R.user),
                    joinedload(R.vacancy),
                )
                .where(R.user_id == user_id)
                .order_by(R.created_at.desc())
                .limit(limit)
                .offset(offset)
            )
            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def exists_for_vacancy_and_user(
        self,
        vacancy_id: int,
        user_id: int,
    ) -> bool:
        R = Response
        async with self._sm() as s:
            stmt = (
                select(func.count())
                .select_from(R)
                .where(R.vacancy_id == vacancy_id)
                .where(R.user_id == user_id)
            )
            res = await s.execute(stmt)
            return res.scalar_one() > 0

    async def create(
        self,
        vacancy_id: int,
        application_id: int,
        user_id: int,
    ) -> Response:
        R = Response
        async with self._sm() as s:
            obj = R(
                vacancy_id=vacancy_id,
                user_id=user_id,
                application_id=application_id,
                status=ResponseStatus.pending,
            )
            s.add(obj)
            await s.commit()
            # чтобы были заполнены .user и .vacancy
            await s.refresh(obj)
            return obj

    async def update_status(
        self,
        response_id: int,
        status: ResponseStatus,
    ) -> Optional[Response]:
        R = Response
        async with self._sm() as s:
            obj = await s.get(R, response_id)
            if not obj:
                return None
            obj.status = status
            await s.commit()
            await s.refresh(obj)
            return obj
    
    async def expire_all_for_vacancy(
        self,
        vacancy_id: int,
    ) -> None:
        """
        Помечает все pending-отклики на вакансию как expired
        """
        R = Response
        async with self._sm() as s:
            stmt = (
                update(R)
                .values(status=ResponseStatus.expired)
                .where(R.vacancy_id == vacancy_id)
                .where(R.status == ResponseStatus.pending)
            )
            
            await s.execute(stmt)
            await s.commit()

    async def expire_other_pending_for_user_on_hackathon(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        except_response_id: int,
    ) -> None:
        """
        Ставит статус `expired` всем pending-откликам пользователя
        на другие вакансии того же хакатона.
        """
        R = Response
        V = Vacancy
        T = Team

        async with self._sm() as s:
            stmt = (
                update(R)
                .values(status=ResponseStatus.expired)
                .where(R.user_id == user_id)
                .where(R.status == ResponseStatus.pending)
                .where(R.id != except_response_id)
                .where(R.vacancy_id == V.id)
                .where(V.team_id == T.id)
                .where(T.hackathon_id == hackathon_id)
            )
            await s.execute(stmt)
            await s.commit()

    async def get_by_vacancy_and_application(
        self,
        vacancy_id: int,
        application_id: int,
    ) -> Optional[Response]:
        """Получить отклик по вакансии и анкете."""
        R = Response
        async with self._sm() as s:
            stmt = (
                select(R)
                .where(R.vacancy_id == vacancy_id)
                .where(R.application_id == application_id)
            )
            res = await s.execute(stmt)
            return res.scalar_one_or_none()

    async def count_active_for_application(
        self,
        application_id: int,
        status: ResponseStatus = ResponseStatus.pending,
    ) -> int:
        """Посчитать количество активных откликов для анкеты (по умолчанию - pending)."""
        R = Response
        async with self._sm() as s:
            stmt = (
                select(func.count(R.id))
                .where(R.application_id == application_id)
                .where(R.status == status)
            )
            res = await s.execute(stmt)
            return res.scalar_one() or 0
        