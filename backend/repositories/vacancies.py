from __future__ import annotations

from typing import Optional, List, Sequence, Any

from sqlalchemy import select

from backend.repositories.base import BaseRepository
from backend.persistend.enums import VacancyStatus, RoleType
from backend.persistend.models.vacancy import Vacancy
from backend.persistend.models.team import Team


class VacanciesRepo(BaseRepository):
    async def get_by_id(self, vacancy_id: int) -> Optional[Vacancy]:
        async with self._sm() as s:
            return await s.get(Vacancy, vacancy_id)

    async def list_for_team(
        self,
        *,
        team_id: int,
        status: Optional[VacancyStatus] = None,
    ) -> List[Vacancy]:
        V = Vacancy
        async with self._sm() as s:
            stmt = select(V).where(V.team_id == team_id)
            if status:
                stmt = stmt.where(V.status == status)

            stmt = stmt.order_by(V.created_at.desc())
            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def list_for_hackathon(
        self,
        *,
        hackathon_id: int,
        role: Optional[RoleType] = None,
        only_open: bool = True,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Vacancy]:
        V = Vacancy
        T = Team
        async with self._sm() as s:
            stmt = (
                select(V)
                .join(T, T.id == V.team_id)
                .where(T.hackathon_id == hackathon_id)
            )

            if only_open:
                stmt = stmt.where(V.status == VacancyStatus.open)
            if role:
                stmt = stmt.where(V.role == role)

            stmt = stmt.order_by(V.created_at.desc()).offset(offset).limit(limit)

            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def create(
        self,
        *,
        team_id: int,
        role: RoleType,
        description: Optional[str],
        skills: Optional[Sequence[str]] = None,
    ) -> Vacancy:
        async with self._sm() as s:
            obj = Vacancy(
                team_id=team_id,
                role=role,
                description=description,
                skills=list(skills) if skills is not None else [],
                status=VacancyStatus.open,
            )
            s.add(obj)
            await s.commit()
            await s.refresh(obj)
            return obj

    async def update(
        self, vacancy_id: int, fields: dict[str, Any]
    ) -> Optional[Vacancy]:
        async with self._sm() as s:
            obj = await s.get(Vacancy, vacancy_id)
            if not obj:
                return None

            for key, value in fields.items():
                if value is not None:
                    setattr(obj, key, value)

            await s.commit()
            await s.refresh(obj)
            return obj

    async def delete(self, vacancy_id: int) -> bool:
        async with self._sm() as s:
            obj = await s.get(Vacancy, vacancy_id)
            if not obj:
                return False

            await s.delete(obj)
            await s.commit()
            return True
