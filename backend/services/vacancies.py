from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, List, Sequence, Any

from backend.persistend.enums import RoleType, VacancyStatus
from backend.persistend.models.vacancy import Vacancy
from backend.repositories.vacancies import VacanciesRepo


class VacanciesService:
    """
    Тонкий сервис для работы с вакансиями.
    Вся бизнес-логика (права капитана, статус хакатона и т.п.)
    реализуется в роутерах.
    """

    def __init__(self, vacancies_repo: Optional[VacanciesRepo] = None) -> None:
        self.vacancies = vacancies_repo or VacanciesRepo()

    # --- чтение ---

    async def get_by_id(self, vacancy_id: int) -> Optional[Vacancy]:
        return await self.vacancies.get_by_id(vacancy_id)

    async def list_for_team(
        self,
        *,
        team_id: int,
        status: Optional[VacancyStatus] = None,
    ) -> List[Vacancy]:
        return await self.vacancies.list_for_team(
            team_id=team_id,
            status=status,
        )

    async def list_for_hackathon(
        self,
        *,
        hackathon_id: int,
        role: Optional[RoleType] = None,
        only_open: bool = True,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Vacancy]:
        return await self.vacancies.list_for_hackathon(
            hackathon_id=hackathon_id,
            role=role,
            only_open=only_open,
            limit=limit,
            offset=offset,
        )

    # --- создание ---

    async def create(
        self,
        *,
        team_id: int,
        role: RoleType,
        description: Optional[str],
        skills: Optional[Sequence[str]] = None,
    ) -> Vacancy:
        return await self.vacancies.create(
            team_id=team_id,
            role=role,
            description=description,
            skills=skills,
        )

    # --- обновление ---

    async def update(
        self,
        vacancy_id: int,
        fields: dict[str, Any],
    ) -> Optional[Vacancy]:
        """
        Частично обновить вакансию по словарю полей.
        Роутер сам решает, что можно менять и кто имеет право.
        """
        return await self.vacancies.update(vacancy_id, fields)

    # --- удаление ---

    async def delete(self, vacancy_id: int) -> bool:
        return await self.vacancies.delete(vacancy_id)
