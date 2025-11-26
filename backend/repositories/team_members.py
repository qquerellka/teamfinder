# backend/repositories/team_members.py

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.persistend.models.team_member import TeamMember


class TeamMembersRepo:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_member(self, team_id: int, user_id: int, role: str, is_captain: bool = False):
        member = TeamMember(
            team_id=team_id,
            user_id=user_id,
            role=role,
            is_captain=is_captain,
        )
        self.session.add(member)
        await self.session.flush()
        return member

    async def get_member(self, team_id: int, user_id: int):
        q = select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        )
        res = await self.session.execute(q)
        return res.scalar_one_or_none()

    async def remove_member(self, team_id: int, user_id: int):
        q = delete(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        )
        await self.session.execute(q)

    async def list_team_members(self, team_id: int):
        q = select(TeamMember).where(TeamMember.team_id == team_id)
        res = await self.session.execute(q)
        return res.scalars().all()
