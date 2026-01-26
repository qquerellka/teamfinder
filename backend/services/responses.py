from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, List

from persistend.enums import ResponseStatus, RoleType, ApplicationStatus, VacancyStatus
from persistend.models.response import Response
from persistend.models.vacancy import Vacancy
from persistend.models.team import Team
from persistend.models.application import Application

from repositories.responses import ResponsesRepo
from repositories.vacancies import VacanciesRepo
from repositories.teams import TeamsRepo
from repositories.team_members import team_members_repo, TeamMembersRepo
from repositories.applications import ApplicationsRepo
from repositories.invites import invites_repo, InvitesRepo


@dataclass(frozen=True)
class ResponseWithContext:
    response: Response
    vacancy: Vacancy
    team: Team
    application: Application


class ResponsesService:
    """
    Сервис для работы с откликами.

    Основные правила:
      - Отклик создаёт только владелец анкеты (current_user_id).
      - Отклик возможен только если у пользователя есть анкета на этот хакатон.
      - Можно ограничить число активных откликов для одной анкеты.
      - Менять статус отклика (accept/reject и т.п.) может только капитан команды.
    """

    def __init__(
        self,
        responses_repo: Optional[ResponsesRepo] = None,
        vacancies_repo: Optional[VacanciesRepo] = None,
        teams_repo: Optional[TeamsRepo] = None,
        team_members_repository: Optional[TeamMembersRepo] = None,
        invites_repository: Optional[InvitesRepo] = None,
        applications_repo: Optional[ApplicationsRepo] = None,
        max_active_per_application: int = 10,
    ) -> None:
        self.responses = responses_repo or ResponsesRepo()
        self.vacancies = vacancies_repo or VacanciesRepo()
        self.teams = teams_repo or TeamsRepo()
        self.team_members = team_members_repository or team_members_repo
        self.invites = invites_repository or invites_repo
        self.apps = applications_repo or ApplicationsRepo()
        self.max_active_per_application = max_active_per_application

    # --- внутренние хелперы ---

    async def _get_vacancy_or_404(self, vacancy_id: int) -> Vacancy:
        vacancy = await self.vacancies.get_by_id(vacancy_id)
        if not vacancy:
            raise ValueError("vacancy_not_found")
        return vacancy

    async def _get_team_or_404(self, team_id: int) -> Team:
        team = await self.teams.get_by_id(team_id)
        if not team:
            raise ValueError("team_not_found")
        return team

    async def _get_application_or_404(self, app_id: int) -> Application:
        app = await self.apps.get_by_id(app_id)
        if not app:
            raise ValueError("application_not_found")
        return app

    async def _ensure_captain(self, team: Team, current_user_id: int) -> None:
        if team.captain_id != current_user_id:
            raise PermissionError("not_team_captain")

    async def _process_acceptance(
        self,
        response: Response,
        vacancy: Vacancy,
        team: Team,
        application: Application,
    ) -> Response:
        """
        Обработка принятия отклика и присоединения пользователя к команде
        """
        if application.status != ApplicationStatus.published:
            raise ValueError("application_not_active")

        updated_response = await self.responses.update_status(
            response_id=response.id,
            status=ResponseStatus.accepted
        )
        if not updated_response:
            raise ValueError("response_not_found")

        await self.team_members.add_member(
            team_id=team.id,
            user_id=response.user_id,
            role=vacancy.role
        )

        await self.apps.update(
            app_id=application.id,
            data={
                "status": ApplicationStatus.hidden,
                "joined": True
            }
        )

        await self.vacancies.update(
            vacancy_id=vacancy.id,
            fields={
                "status": VacancyStatus.closed
            }
        )

        await self.responses.expire_all_for_vacancy(
            vacancy_id=vacancy.id
        )

        await self.responses.expire_other_pending_for_user_on_hackathon(
            user_id=response.user_id,
            hackathon_id=team.hackathon_id,
            except_response_id=response.id
        )

        await self.invites.expire_all_pending_for_application(
            application_id=application.id
        )

        return updated_response

    # --- чтение ---

    async def get(self, response_id: int) -> Optional[Response]:
        return await self.responses.get_by_id(response_id)

    async def get_with_context(self, response_id: int) -> Optional[ResponseWithContext]:
        resp = await self.responses.get_by_id(response_id)
        if not resp:
            return None

        vacancy = await self._get_vacancy_or_404(resp.vacancy_id)
        team = await self._get_team_or_404(vacancy.team_id)
        app = await self._get_application_or_404(resp.application_id)

        return ResponseWithContext(
            response=resp,
            vacancy=vacancy,
            team=team,
            application=app,
        )

    async def list_for_vacancy_for_captain(
        self,
        *,
        current_user_id: int,
        vacancy_id: int,
    ) -> List[Response]:
        vacancy = await self._get_vacancy_or_404(vacancy_id)
        team = await self._get_team_or_404(vacancy.team_id)
        await self._ensure_captain(team, current_user_id)

        return await self.responses.list_for_vacancy(vacancy_id)

    async def list_for_user(
        self, user_id: int, limit: int, offset: int
    ) -> List[Response]:
        return await self.responses.list_for_user(
            user_id=user_id, limit=limit, offset=offset
        )

    # --- создание отклика ---

    async def create_for_vacancy(
        self,
        *,
        current_user_id: int,
        vacancy_id: int,
        desired_role: Optional[RoleType] = None,
    ) -> Response:
        """
        Создать отклик на вакансию.

        Правила:
          - Находим вакансию -> команду -> хакатон.
          - Находим анкету пользователя для этого хакатона.
          - Проверяем лимит активных откликов для этой анкеты.
          - Проверяем, что нет уже отклика app+vacancy (идемпотентность).
        Возможные ошибки:
          - ValueError("vacancy_not_found")
          - ValueError("team_not_found")
          - ValueError("application_not_found")
          - ValueError("too_many_active_responses")
          - ValueError("response_exists")
        """
        vacancy = await self._get_vacancy_or_404(vacancy_id)
        team = await self._get_team_or_404(vacancy.team_id)

        # 1. Ищем анкету этого пользователя на тот же hackathon
        app = await self.apps.get_by_user_and_hackathon(
            user_id=current_user_id,
            hackathon_id=team.hackathon_id,
        )
        if not app:
            raise ValueError("application_not_found")

        # 2. Проверяем, что нет уже отклика для (vacancy, application)
        existing = await self.responses.get_by_vacancy_and_application(
            vacancy_id=vacancy.id,
            application_id=app.id,
        )
        if existing:
            raise ValueError("response_exists")

        # 3. Проверяем лимит активных откликов для анкеты
        active_count = await self.responses.count_active_for_application(app.id)
        if active_count >= self.max_active_per_application:
            raise ValueError("too_many_active_responses")

        # 4. Выбираем роль: либо явно заданную, либо роль из анкеты, либо роль вакансии
        role = desired_role or app.role or vacancy.role

        return await self.responses.create(
            vacancy_id=vacancy.id,
            application_id=app.id,
            user_id=current_user_id,
        )

    async def accept_response(
        self,
        response_id: int,
        current_user_id: int,
    ) -> Response:
        """
        Принять отклик и выполнить все связанные операции.
        Вызывается только капитаном команды.
        """
        rwc = await self.get_with_context(response_id)
        if not rwc:
            raise ValueError("response_not_found")

        response, vacancy, team, application = (
            rwc.response, rwc.vacancy, rwc.team, rwc.application
        )

        await self._ensure_captain(team, current_user_id)

        already = await self.teams.user_has_team_on_hackathon(
            user_id=response.user_id,
            hackathon_id=team.hackathon_id,
        )
        if already:
            raise ValueError("user_already_in_team")

        return await self._process_acceptance(response, vacancy, team, application)

    async def reject_response(
        self,
        response_id: int,
        current_user_id: int,
    ) -> Response:
        """
        Отклонить отклик, вызывается только капитаном
        """
        rwc = await self.get_with_context(response_id)
        if not rwc:
            raise ValueError("response_not_found")

        await self._ensure_captain(rwc.team, current_user_id)

        return await self.responses.update_status(response_id, ResponseStatus.rejected)

    async def withdraw_response(
        self,
        response_id: int,
        current_user_id: int,
    ) -> Response:
        """
        Отозвать свой отклик, вызывается только владельцем отклика
        """
        response = await self.responses.get_by_id(response_id)
        if not response:
            raise ValueError("response_not_found")

        if response.user_id != current_user_id:
            raise PermissionError("not_response_owner")

        if response.status != ResponseStatus.pending:
            raise ValueError("only_pending_can_be_withdrawn")

        return await self.responses.update_status(response_id, ResponseStatus.withdrawn)
