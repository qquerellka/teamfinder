# backend/repositories/team_join.py

from __future__ import annotations

from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.repositories.base import BaseRepository
from backend.persistend.enums import (
    InviteStatus,
    ResponseStatus,
    ApplicationStatus,
    RoleType,
)
from backend.persistend.models import (
    team as m_team,
    team_member as m_tm,
    application as m_app,
    invites as m_inv,
    vacancy as m_vac,
    response as m_resp,
)


class TeamJoinService(BaseRepository):
    """
    Сервис, который отвечает за атомарное «вступление в команду»:
      • accept инвайта
      • accept отклика (response)
    Логика одинаковая, отличается только точкой входа (invite_id vs response_id).
    """

    # ---------- Публичные методы ----------

    async def accept_invite(
        self,
        invite_id: int,
        acting_user_id: int,
    ) -> m_inv.Invite:
        """
        Принятие инвайта пользователем (owner анкеты).
        Инварианты:
          • Invite.status == pending.
          • acting_user_id == application.user_id.
          • В этом хакатоне пользователь ещё не в команде (инвариант контролируется триггером в БД).
        Побочные эффекты:
          • создаётся TeamMember;
          • Invite.status -> accepted;
          • Application.status -> hidden, joined = TRUE;
          • все другие pending-инвайты и отклики этого application в этом хакатоне -> expired;
          • вакансия не участвует, потому что инвайт без vacancy.
        """
        async with self._sm.begin() as session:
            # Берём инвайт, вместе с application и team
            invite = await self._load_invite_for_update(session, invite_id)

            app = invite.application
            team = invite.team

            # Валидация: кто имеет право принимать
            if app.user_id != acting_user_id:
                raise PermissionError("only invited user can accept invite")

            # Валидация статуса
            if invite.status is not InviteStatus.pending:
                raise ValueError(f"invite already {invite.status}")

            # Достаём роль
            invited_role: RoleType = invite.invited_role

            # Вступаем в команду
            await self._join_user_to_team(
                session=session,
                team=team,
                app=app,
                role=invited_role,
            )

            # Обновляем статус инвайта
            invite.status = InviteStatus.accepted

            # Гасим остальные инвайты/отклики анкеты по этому хакатону
            await self._expire_other_invites_and_responses(
                session=session,
                app_id=app.id,
                except_invite_id=invite.id,
                except_response_id=None,
            )

            return invite

    async def accept_response(
        self,
        response_id: int,
        acting_user_id: int,
    ) -> m_resp.Response:
        """
        Принятие отклика капитаном.
        Инварианты:
          • Response.status == pending.
          • acting_user_id == vacancy.team.captain_id.
          • У response есть ссылка на application (через FK или join) — предположительно поле application_id.
        Побочные эффекты:
          • создаётся TeamMember;
          • Response.status -> accepted;
          • Vacancy.status -> closed;
          • Application.status -> hidden, joined = TRUE;
          • все другие pending-инвайты/отклики этой анкеты на этом хакатоне -> expired.
        """
        async with self._sm.begin() as session:
            # Загружаем response с vacancy, team и application
            response = await self._load_response_for_update(session, response_id)

            vac = response.vacancy
            team = vac.team
            app = response.application

            # Проверяем, что действует капитан
            if team.captain_id != acting_user_id:
                raise PermissionError("only team captain can accept response")

            # Проверяем статус отклика
            if response.status is not ResponseStatus.pending:
                raise ValueError(f"response already {response.status}")

            # Роль берём либо из desired_role, либо из application.role, на твой выбор.
            role: RoleType = response.desired_role or app.role

            # Вступление в команду
            await self._join_user_to_team(
                session=session,
                team=team,
                app=app,
                role=role,
            )

            # Обновляем статусы
            response.status = ResponseStatus.accepted
            vac.status = vac.status.__class__.closed  # vacancy_status.closed

            await self._expire_other_invites_and_responses(
                session=session,
                app_id=app.id,
                except_invite_id=None,
                except_response_id=response.id,
            )

            return response

    # ---------- Внутренние хелперы ----------

    async def _load_invite_for_update(
        self,
        session: AsyncSession,
        invite_id: int,
    ) -> m_inv.Invite:
        stmt = (
            select(m_inv.Invite)
            .where(m_inv.Invite.id == invite_id)
            .options(
                # Достаём связанные сущности одним запросом
                m_inv.Invite.team,
                m_inv.Invite.application,
            )
            # Можно добавить .with_for_update() при желании
        )
        res = await session.execute(stmt)
        invite: Optional[m_inv.Invite] = res.scalars().unique().first()
        if not invite:
            raise ValueError("invite not found")
        return invite

    async def _load_response_for_update(
        self,
        session: AsyncSession,
        response_id: int,
    ) -> m_resp.Response:
        stmt = (
            select(m_resp.Response)
            .where(m_resp.Response.id == response_id)
            .options(
                m_resp.Response.vacancy,
                m_resp.Response.application,
                m_resp.Response.vacancy.property.mapper.class_.team,  # vacancy.team
            )
        )
        res = await session.execute(stmt)
        response: Optional[m_resp.Response] = res.scalars().unique().first()
        if not response:
            raise ValueError("response not found")
        return response

    async def _join_user_to_team(
        self,
        session: AsyncSession,
        *,
        team: m_team.Team,
        app: m_app.Application,
        role: RoleType,
    ) -> m_tm.TeamMember:
        """
        Создаёт TeamMember. Инвариант «1 команда на хак» дополнительно
        контролируется триггером в БД (trg_one_team_per_hack).
        """
        member = m_tm.TeamMember(
            team_id=team.id,
            user_id=app.user_id,
            role=role,
            is_captain=False,
        )
        session.add(member)

        # Обновляем анкету
        app.status = ApplicationStatus.hidden
        app.joined = True

        return member

    async def _expire_other_invites_and_responses(
        self,
        session: AsyncSession,
        *,
        app_id: int,
        except_invite_id: Optional[int],
        except_response_id: Optional[int],
    ) -> None:
        """
        Переводит все pending-инвайты и отклики для этой анкеты в expired,
        кроме «успешного» (accept).
        Предполагается, что у Response есть поле application_id.
        """

        # Инвайты
        invite_stmt = (
            update(m_inv.Invite)
            .where(
                m_inv.Invite.application_id == app_id,
                m_inv.Invite.status == InviteStatus.pending,
            )
        )
        if except_invite_id is not None:
            invite_stmt = invite_stmt.where(m_inv.Invite.id != except_invite_id)

        await session.execute(
            invite_stmt.values(status=InviteStatus.expired)
        )

        # Отклики
        response_stmt = (
            update(m_resp.Response)
            .where(
                m_resp.Response.application_id == app_id,
                m_resp.Response.status == ResponseStatus.pending,
            )
        )
        if except_response_id is not None:
            response_stmt = response_stmt.where(
                m_resp.Response.id != except_response_id
            )

        await session.execute(
            response_stmt.values(status=ResponseStatus.expired)
        )
