from __future__ import annotations

from typing import Optional, List

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from persistend.enums import InviteStatus, RoleType
from persistend.models.invite import Invite
from persistend.models.application import Application
from persistend.models.team import Team

from infrastructure.db import get_sessionmaker
async_session_maker = get_sessionmaker()

class InvitesRepo:
    async def get_by_id(self, invite_id: int) -> Optional[Invite]:
        async with async_session_maker() as session:
            res = await session.execute(
                select(Invite).where(Invite.id == invite_id)
            )
            return res.scalar_one_or_none()

    async def get_by_team_and_application(
        self,
        team_id: int,
        application_id: int,
    ) -> Optional[Invite]:
        async with async_session_maker() as session:
            res = await session.execute(
                select(Invite).where(
                    Invite.team_id == team_id,
                    Invite.application_id == application_id,
                )
            )
            return res.scalar_one_or_none()

    async def has_accepted_for_application(self, application_id: int) -> bool:
        async with async_session_maker() as session:
            res = await session.execute(
                select(func.count())
                .select_from(Invite)
                .where(
                    Invite.application_id == application_id,
                    Invite.status == InviteStatus.accepted,
                )
            )
            return res.scalar_one() > 0

    async def create(
        self,
        *,
        team_id: int,
        application_id: int,
        invited_role: RoleType,
        expires_at=None,
    ) -> Invite:
        async with async_session_maker() as session:
            inv = Invite(
                team_id=team_id,
                application_id=application_id,
                invited_role=invited_role,
                expires_at=expires_at,
            )
            session.add(inv)
            await session.commit()
            await session.refresh(inv)
            return inv

    async def update_status(
        self, invite_id: int, status: InviteStatus
    ) -> Optional[Invite]:
        async with async_session_maker() as session:
            res = await session.execute(
                select(Invite).where(Invite.id == invite_id)
            )
            inv = res.scalar_one_or_none()
            if not inv:
                return None
            inv.status = status
            await session.commit()
            await session.refresh(inv)
            return inv

    async def list_for_team(
        self,
        team_id: int,
        status: Optional[InviteStatus] = None,
    ) -> List[Invite]:
        async with async_session_maker() as session:
            stmt = select(Invite).where(Invite.team_id == team_id)
            if status is not None:
                stmt = stmt.where(Invite.status == status)
            stmt = stmt.order_by(Invite.created_at.desc())
            res = await session.execute(stmt)
            return list(res.scalars().all())

    async def list_for_application(
        self,
        application_id: int,
        status: Optional[InviteStatus] = None,
    ) -> List[Invite]:
        async with async_session_maker() as session:
            stmt = select(Invite).where(Invite.application_id == application_id)
            if status is not None:
                stmt = stmt.where(Invite.status == status)
            stmt = stmt.order_by(Invite.created_at.desc())
            res = await session.execute(stmt)
            return list(res.scalars().all())

    async def list_for_user(
        self,
        *,
        user_id: int,
        hackathon_id: Optional[int] = None,
        status: Optional[InviteStatus] = None,
    ) -> List[Invite]:
        """
        Все инвайты к анкетам пользователя, опционально отфильтрованные по хакатону и статусу.
        """
        async with async_session_maker() as session:
            stmt = (
                select(Invite)
                .join(Application, Application.id == Invite.application_id)
                .join(Team, Team.id == Invite.team_id)
                .where(Application.user_id == user_id)
            )
            if hackathon_id is not None:
                stmt = stmt.where(Team.hackathon_id == hackathon_id)
            if status is not None:
                stmt = stmt.where(Invite.status == status)
            stmt = stmt.order_by(Invite.created_at.desc())
            res = await session.execute(stmt)
            return list(res.scalars().all())
