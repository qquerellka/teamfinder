from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from infrastructure.db import get_sessionmaker
from persistend.enums import InviteStatus, RoleType
from persistend.models.invite import Invite
from persistend.models.team import Team
from persistend.models.application import Application
from persistend.models.team_member import TeamMember
from persistend.models.hackathon import Hackathon

from repositories.invites import InvitesRepo
from repositories.teams import TeamsRepo
from repositories.applications import ApplicationsRepo
from repositories.hackathons import HackathonsRepo


@dataclass(frozen=True)
class InviteWithContext:
    invite: Invite
    team: Team
    application: Application
    hackathon: Hackathon


class InvitesService:
    """
    Сервис для работы с инвайтами.

    Ключевое: права и проверки завязаны на team_member:
      - капитан команды определяется по TeamMember.is_captain.
      - проверка, что пользователь уже состоит в команде на хакатоне
        делается по join(team_member, team).
    """

    def __init__(
        self,
        invites_repo: Optional[InvitesRepo] = None,
        applications_repo: Optional[ApplicationsRepo] = None,
        teams_repo: Optional[TeamsRepo] = None,
        hackathons_repo: Optional[HackathonsRepo] = None,
        sessionmaker: Optional[async_sessionmaker[AsyncSession]] = None,
    ) -> None:
        self.invites = invites_repo or InvitesRepo()
        self.apps = applications_repo or ApplicationsRepo()
        self.teams = teams_repo or TeamsRepo()
        self.hacks = hackathons_repo or HackathonsRepo()
        self._sessionmaker = sessionmaker or get_sessionmaker()

    # ---- helpers (team_member) ----

    async def _user_is_captain(self, *, team_id: int, user_id: int) -> bool:
        async with self._sessionmaker() as session:
            res = await session.execute(
                select(func.count())
                .select_from(TeamMember)
                .where(
                    TeamMember.team_id == team_id,
                    TeamMember.user_id == user_id,
                    TeamMember.is_captain.is_(True),
                )
            )
            return res.scalar_one() > 0

    async def _user_in_team(self, *, team_id: int, user_id: int) -> bool:
        async with self._sessionmaker() as session:
            res = await session.execute(
                select(func.count())
                .select_from(TeamMember)
                .where(
                    TeamMember.team_id == team_id,
                    TeamMember.user_id == user_id,
                )
            )
            return res.scalar_one() > 0

    async def _user_has_team_on_hackathon(
        self,
        *,
        user_id: int,
        hackathon_id: int,
    ) -> bool:
        async with self._sessionmaker() as session:
            res = await session.execute(
                select(func.count())
                .select_from(TeamMember)
                .join(Team, Team.id == TeamMember.team_id)
                .where(
                    TeamMember.user_id == user_id,
                    Team.hackathon_id == hackathon_id,
                )
            )
            return res.scalar_one() > 0

    async def _load_context(self, invite_id: int) -> Optional[InviteWithContext]:
        inv = await self.invites.get_by_id(invite_id)
        if not inv:
            return None

        team = await self.teams.get_by_id(inv.team_id)
        app = await self.apps.get_by_id(inv.application_id)
        if not team or not app:
            return None

        hack = await self.hacks.get_by_id(team.hackathon_id)
        if not hack:
            return None

        return InviteWithContext(
            invite=inv,
            team=team,
            application=app,
            hackathon=hack,
        )

    # ---- создание инвайта капитаном команды ----

    async def create_for_team(
        self,
        *,
        current_user_id: int,
        team_id: int,
        application_id: int,
        invited_role: RoleType,
    ) -> Invite:
        team = await self.teams.get_by_id(team_id)
        if not team:
            raise ValueError("team_not_found")

        # Проверяем, что current_user_id — капитан этой команды через team_member
        if not await self._user_is_captain(team_id=team_id, user_id=current_user_id):
            raise PermissionError("not_team_captain")

        app = await self.apps.get_by_id(application_id)
        if not app:
            raise ValueError("application_not_found")

        # Один хакатон
        if app.hackathon_id != team.hackathon_id:
            raise ValueError("different_hackathon")

        # Владелец анкеты не участник этой команды
        if await self._user_in_team(team_id=team.id, user_id=app.user_id):
            raise ValueError("user_already_in_this_team")

        # Владелец анкеты не состоит ни в одной команде этого хакатона
        if await self._user_has_team_on_hackathon(
            user_id=app.user_id,
            hackathon_id=team.hackathon_id,
        ):
            raise ValueError("user_already_in_team_for_hackathon")

        # По этой анкете нет accepted-инвайта
        if await self.invites.has_accepted_for_application(app.id):
            raise ValueError("application_already_has_accepted_invite")

        # Нет уже инвайта от этой команды к этой анкете
        existing = await self.invites.get_by_team_and_application(
            team_id=team.id,
            application_id=app.id,
        )
        if existing:
            raise ValueError("invite_already_exists")

        # Создаём
        return await self.invites.create(
            team_id=team.id,
            application_id=app.id,
            invited_role=invited_role,
        )

    # ---- чтение ----

    async def list_for_team_for_captain(
        self,
        *,
        current_user_id: int,
        team_id: int,
        status: Optional[InviteStatus] = None,
    ) -> List[Invite]:
        team = await self.teams.get_by_id(team_id)
        if not team:
            raise ValueError("team_not_found")

        if not await self._user_is_captain(team_id=team_id, user_id=current_user_id):
            raise PermissionError("not_team_captain")

        return await self.invites.list_for_team(team_id=team_id, status=status)

    async def list_for_application_for_owner(
        self,
        *,
        current_user_id: int,
        application_id: int,
        status: Optional[InviteStatus] = None,
    ) -> List[Invite]:
        app = await self.apps.get_by_id(application_id)
        if not app:
            raise ValueError("application_not_found")

        if app.user_id != current_user_id:
            raise PermissionError("not_application_owner")

        return await self.invites.list_for_application(
            application_id=application_id,
            status=status,
        )

    async def list_for_user(
        self,
        *,
        current_user_id: int,
        hackathon_id: Optional[int] = None,
        status: Optional[InviteStatus] = None,
    ) -> List[Invite]:
        return await self.invites.list_for_user(
            user_id=current_user_id,
            hackathon_id=hackathon_id,
            status=status,
        )

    async def get_for_user(
        self,
        *,
        current_user_id: int,
        invite_id: int,
    ) -> InviteWithContext:
        ctx = await self._load_context(invite_id)
        if not ctx:
            raise ValueError("invite_not_found")

        app = ctx.application
        team = ctx.team

        # либо владелец анкеты, либо капитан команды
        is_owner = app.user_id == current_user_id
        is_captain = await self._user_is_captain(team_id=team.id, user_id=current_user_id)

        if not (is_owner or is_captain):
            raise PermissionError("forbidden")

        return ctx

    # ---- смена статуса (accepted / rejected) владельцем анкеты ----

    async def change_status_by_owner(
        self,
        *,
        current_user_id: int,
        invite_id: int,
        new_status: InviteStatus,
    ) -> Invite:
        if new_status not in (InviteStatus.accepted, InviteStatus.rejected):
            raise ValueError("invalid_status")

        ctx = await self._load_context(invite_id)
        if not ctx:
            raise ValueError("invite_not_found")

        inv = ctx.invite
        app = ctx.application
        team = ctx.team

        # владелец анкеты
        if app.user_id != current_user_id:
            raise PermissionError("not_application_owner")

        # только pending
        if inv.status != InviteStatus.pending:
            raise ValueError("invite_not_pending")

        # проверка на истечение срока
        if inv.expires_at is not None:
            now = datetime.now(timezone.utc)
            if inv.expires_at < now:
                # помечаем expired и возвращаем ошибку
                await self.invites.update_status(invite_id, InviteStatus.expired)
                raise ValueError("invite_expired")

        if new_status == InviteStatus.rejected:
            # rejected — простая ветка
            updated = await self.invites.update_status(invite_id, InviteStatus.rejected)
            if not updated:
                raise ValueError("invite_not_found")
            return updated

        # accepted — сложная ветка:
        # используем SQL-функцию accept_invite(p_invite_id, p_actor_user_id),
        # которая:
        #   - создаёт запись в team_member
        #   - скрывает анкету (joined/hidden)
        #   - экспайрит остальные инвайты и отклики
        async with self._sessionmaker() as session:
            async with session.begin():
                await session.execute(
                    text("SELECT accept_invite(:inv_id, :actor_id)"),
                    {"inv_id": invite_id, "actor_id": current_user_id},
                )
                await session.execute(
                    text(
                        "UPDATE invite SET status = 'accepted' "
                        "WHERE id = :inv_id"
                    ),
                    {"inv_id": invite_id},
                )

            res = await session.execute(
                select(Invite).where(Invite.id == invite_id)
            )
            updated = res.scalar_one()

        return updated
