from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Sequence, List

from backend.persistend.enums import ResponseStatus, RoleType
from backend.persistend.models.response import Response
from backend.persistend.models.vacancy import Vacancy
from backend.persistend.models.team import Team
from backend.persistend.models.application import Application

from backend.repositories.responses import ResponsesRepo
from backend.repositories.vacancies import VacanciesRepo
from backend.repositories.teams import TeamsRepo
from backend.repositories.applications import ApplicationsRepo


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
        applications_repo: Optional[ApplicationsRepo] = None,
        max_active_per_application: int = 10,
    ) -> None:
        self.responses = responses_repo or ResponsesRepo()
        self.vacancies = vacancies_repo or VacanciesRepo()
        self.teams = teams_repo or TeamsRepo()
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
            desired_role=role,
        )

    # --- смена статуса отклика капитаном ---

    async def change_status_by_captain(
        self,
        *,
        current_user_id: int,
        response_id: int,
        new_status: ResponseStatus,
    ) -> Response:
        """
        Сменить статус отклика (accept/reject/…) от имени капитана команды.

        Правила:
          - Берём отклик -> вакансию -> команду.
          - Проверяем, что current_user_id — капитан этой команды.
        """
        resp = await self.responses.get_by_id(response_id)
        if not resp:
            raise ValueError("response_not_found")

        vacancy = await self._get_vacancy_or_404(resp.vacancy_id)
        team = await self._get_team_or_404(vacancy.team_id)
        await self._ensure_captain(team, current_user_id)

        updated = await self.responses.update_status(response_id, new_status)
        if not updated:
            raise ValueError("response_not_found")

        return updated
