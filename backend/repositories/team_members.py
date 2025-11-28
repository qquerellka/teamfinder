from __future__ import annotations

from typing import Optional, List

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.repositories.base import BaseRepository
from backend.persistend.enums import RoleType
from backend.persistend.models.team_member import TeamMember


class TeamMembersRepo(BaseRepository):
    async def list_members(self, team_id: int) -> List[TeamMember]:
        TM = TeamMember
        async with self._sm() as s:
            stmt = (
                select(TM).where(TM.team_id == team_id).options(selectinload(TM.user))
            )
            res = await s.execute(stmt)
            return res.scalars().all()

    async def get_membership(self, team_id: int, user_id: int) -> Optional[TeamMember]:
        TM = TeamMember
        async with self._sm() as s:
            stmt = (
                select(TM)
                .where(TM.team_id == team_id)
                .where(TM.user_id == user_id)
                .limit(1)
            )
            res = await s.execute(stmt)
            return res.scalars().first()

    async def add_member(
        self,
        *,
        team_id: int,
        user_id: int,
        role: RoleType,
        is_captain: bool = False,
    ) -> TeamMember:
        TM = TeamMember
        async with self._sm() as s:
            obj = TM(
                team_id=team_id,
                user_id=user_id,
                role=role,
                is_captain=is_captain,
            )
            s.add(obj)
            await s.commit()
            await s.refresh(obj)
            return obj

    async def update_member(
        self,
        *,
        team_id: int,
        user_id: int,
        data: dict,
    ) -> Optional[TeamMember]:
        TM = TeamMember
        async with self._sm() as s:
            stmt = (
                select(TM)
                .where(TM.team_id == team_id)
                .where(TM.user_id == user_id)
                .limit(1)
            )
            res = await s.execute(stmt)
            obj = res.scalars().first()
            if not obj:
                return None

            for k, v in data.items():
                if v is not None:
                    setattr(obj, k, v)

            await s.commit()
            await s.refresh(obj)
            return obj

    async def delete_member(self, team_id: int, user_id: int) -> bool:
        TM = TeamMember
        async with self._sm() as s:
            stmt = (
                select(TM)
                .where(TM.team_id == team_id)
                .where(TM.user_id == user_id)
                .limit(1)
            )
            res = await s.execute(stmt)
            obj = res.scalars().first()
            if not obj:
                return False

            await s.delete(obj)
            await s.commit()
            return True
