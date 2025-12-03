from __future__ import annotations

from typing import Optional

from backend.repositories.applications import ApplicationsRepo
from backend.repositories.users import UsersRepo


class ApplicationsService:
    """Сервисный слой для анкет пользователей на хакатоны."""

    def __init__(self) -> None:
        self.apps = ApplicationsRepo()
        self.users = UsersRepo()

    # ---- СОЗДАНИЕ ----

    async def create(
        self,
        user_id: int,
        hackathon_id: int,
        role: Optional[str] = None,
        skills: Optional[list[str]] = None,
    ):
        """
        Создать анкету пользователя на хакатон.

        Инварианты:
        - На одну пару (hackathon_id, user_id) допускается только одна анкета.

        При нарушении инварианта:
        - выбрасывает ValueError("app_exists").
        """
        existing = await self.apps.get_by_user_and_hackathon(
            user_id=user_id,
            hackathon_id=hackathon_id,
        )
        if existing:
            raise ValueError("app_exists")

        return await self.apps.create(
            user_id=user_id,
            hackathon_id=hackathon_id,
            role=role,
            skills=skills,
        )

    # ---- СПИСОК / ПОИСК ----

    async def search(
        self,
        hackathon_id: int,
        role: Optional[str] = None,
        q: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ):
        """
        Список анкет по хакатону с фильтрами.

        Параметры:
        - role — роль (строка-Enum).
        - q    — поиск по username/first_name/last_name.
        """
        return await self.apps.search(
            hackathon_id=hackathon_id,
            role=role,
            q=q,
            limit=limit,
            offset=offset,
        )

    # ---- ОБНОВЛЕНИЕ ----

    async def update(self, app_id: int, data: dict):
        """
        Частично обновить анкету по id.

        Параметры:
        - app_id — идентификатор анкеты.
        - data   — словарь полей для изменения.
        """
        return await self.apps.update(app_id, data)

    # ---- ЧТЕНИЕ ----

    async def get(self, app_id: int):
        """Получить анкету по id (или None, если не найдена)."""
        return await self.apps.get_by_id(app_id)

    async def get_my_for_hackathon(self, user_id: int, hackathon_id: int):
        """Получить анкету пользователя на конкретный хакатон (или None)."""
        return await self.apps.get_by_user_and_hackathon(
            user_id=user_id,
            hackathon_id=hackathon_id,
        )

    async def list_my(self, user_id: int):
        """Список всех анкет пользователя по всем хакатонам."""
        return await self.apps.search_by_user(user_id=user_id)

    async def delete(self, app_id: int) -> bool:
        """
        Удалить анкету по id.
        Пока без дополнительной бизнес-логики — просто делегируем репозиторию.
        """
        return await self.apps.delete(app_id)
