from __future__ import annotations

from typing import Optional, List

from sqlalchemy import select, func

from backend.repositories.base import BaseRepository
from backend.persistend.enums import TeamStatus, RoleType
from backend.persistend.models.team import Team
from backend.persistend.models.team_member import TeamMember


class TeamsRepo(BaseRepository):
    async def get_by_id(self, team_id: int) -> Optional[Team]:
        async with self._sm() as s:
            return await s.get(Team, team_id)

    async def create_with_captain(
        self,
        *,
        hackathon_id: int,
        captain_id: int,
        name: str,
        description: Optional[str],
        captain_role: RoleType,
    ) -> Team:
        async with self._sm() as s:
            team = Team(
                hackathon_id=hackathon_id,
                captain_id=captain_id,
                name=name,
                description=description,
                status=TeamStatus.forming,
            )
            s.add(team)
            await s.flush()

            member = TeamMember(
                team_id=team.id,
                user_id=captain_id,
                role=captain_role,
                is_captain=True,
            )
            s.add(member)

            await s.commit()
            await s.refresh(team)
            return team

    async def update(self, team_id: int, data: dict) -> Optional[Team]:
        async with self._sm() as s:
            obj = await s.get(Team, team_id)
            if not obj:
                return None

            for k, v in data.items():
                # если нужно уметь явно ставить None — убери if v is not None
                if v is not None:
                    setattr(obj, k, v)

            await s.commit()
            await s.refresh(obj)
            return obj

    async def delete(self, team_id: int) -> bool:
        async with self._sm() as s:
            obj = await s.get(Team, team_id)
            if not obj:
                return False
            await s.delete(obj)
            await s.commit()
            return True

    async def list_by_hackathon(
        self,
        *,
        hackathon_id: int,
        status: Optional[TeamStatus],
        q: Optional[str],
        owner_id: Optional[int],
        member_user_id: Optional[int],
        limit: int,
        offset: int,
        sort: Optional[str],
    ) -> List[Team]:
        T = Team
        TM = TeamMember

        async with self._sm() as s:
            stmt = select(T).where(T.hackathon_id == hackathon_id)

            if status:
                stmt = stmt.where(T.status == status)

            if owner_id is not None:
                stmt = stmt.where(T.captain_id == owner_id)

            if member_user_id is not None:
                stmt = stmt.join(TM, TM.team_id == T.id).where(
                    TM.user_id == member_user_id
                )

            if q:
                pattern = f"%{q.lower()}%"
                stmt = stmt.where(func.lower(T.name).like(pattern))

            if sort == "name":
                stmt = stmt.order_by(T.name.asc())
            elif sort == "-name":
                stmt = stmt.order_by(T.name.desc())
            elif sort == "created_at":
                stmt = stmt.order_by(T.created_at.asc())
            else:
                stmt = stmt.order_by(T.created_at.desc())

            stmt = stmt.offset(offset).limit(limit)
            res = await s.execute(stmt)
            return res.scalars().unique().all()

    async def list_by_user(self, user_id: int, limit: int, offset: int) -> List[Team]:
        T = Team
        TM = TeamMember

        async with self._sm() as s:
            stmt = (
                select(T)
                .join(TM, TM.team_id == T.id)
                .where(TM.user_id == user_id)
                .order_by(T.created_at.desc())
                .offset(offset)
                .limit(limit)
            )
            res = await s.execute(stmt)
            return res.scalars().unique().all()

    async def user_has_team_on_hackathon(
        self,
        *,
        user_id: int,
        hackathon_id: int,
    ) -> bool:
        T = Team
        TM = TeamMember

        async with self._sm() as s:
            stmt = (
                select(func.count())
                .select_from(TM)
                .join(T, TM.team_id == T.id)
                .where(T.hackathon_id == hackathon_id)
                .where(TM.user_id == user_id)
            )
            res = await s.execute(stmt)
            return res.scalar_one() > 0
