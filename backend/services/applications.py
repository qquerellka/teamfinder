# =============================================================================
# ФАЙЛ: backend/services/applications.py
# КРАТКО: Сервис для работы с анкетами пользователей на хакатоны.
# ЗАЧЕМ:
#   • Инкапсулирует бизнес-логику (уникальность, доступность, простые проверки)
#   • Делегирует SQL-детали репозиторию ApplicationsRepo
# =============================================================================

from __future__ import annotations

from typing import Optional

from backend.repositories.applications import ApplicationsRepo
from backend.repositories.users import UsersRepo
# NOTE: HackathonsRepo пока нет — не импортируем/не используем.


class ApplicationsService:
    """Сервисный слой для анкет."""

    def __init__(self) -> None:
        self.apps = ApplicationsRepo()
        self.users = UsersRepo()

    # ---- СОЗДАНИЕ ----

    async def create(
        self,
        user_id: int,
        hackathon_id: int,
        role: Optional[str] = None,
        title: Optional[str] = None,
        about: Optional[str] = None,
        city: Optional[str] = None,
        skills: Optional[list[str]] = None,  # игнорится на MVP (skills из профиля)
    ):
        """
        Создать анкету пользователя на хакатон.

        Инварианты:
          • На 1 (hackathon_id, user_id) — только 1 анкета.
        Поведение:
          • Если анкета уже существует — поднимаем ValueError("app_exists").
            (Роутер маппит в HTTP 409.)
        """
        # Pre-check, чтобы вернуть дружелюбную ошибку, а не ловить IntegrityError снизу
        existing = await self.apps.get_by_user_and_hackathon(
            user_id=user_id, hackathon_id=hackathon_id
        )
        if existing:
            raise ValueError("app_exists")

        # Создаём (репозиторий сам присвоит дефолты status/joined, выставит опциональные поля при их наличии)
        return await self.apps.create(
            user_id=user_id,
            hackathon_id=hackathon_id,
            role=role,
            title=title,
            about=about,
            city=city,
            skills=skills,
        )

    # ---- СПИСОК/ПОИСК ----

    async def search(
        self,
        hackathon_id: int,
        role: Optional[str] = None,
        q: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ):
        """
        Список анкет хакатона с фильтрами:
          • role — точное совпадение роли
          • q    — username/first_name/last_name (case-insensitive)
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
        Частичное обновление анкеты по id.
        data — {'role': ..., 'status': ..., 'title': ..., 'about': ..., 'city': ...}
        """
        return await self.apps.update(app_id, data)

    # ---- ЧТЕНИЕ ----

    async def get(self, app_id: int):
        """Получить анкету по id (или None)."""
        return await self.apps.get_by_id(app_id)

    async def get_my_for_hackathon(self, user_id: int, hackathon_id: int):
        """Получить мою анкету на конкретный хакатон (или None)."""
        return await self.apps.get_by_user_and_hackathon(
            user_id=user_id, hackathon_id=hackathon_id
        )

    async def list_my(self, user_id: int, limit: int = 50, offset: int = 0):
        """Список всех моих анкет по всем хакатонам (пагинированный)."""
        return await self.apps.search_by_user(
            user_id=user_id, limit=limit, offset=offset
        )
