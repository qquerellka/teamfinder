# =============================================================================
# ФАЙЛ: backend/services/applications.py
# КРАТКО: Сервис для работы с анкетами пользователей на хакатоны.
# ЗАЧЕМ:
#   • Инкапсулирует бизнес-логику (уникальность, доступность, простые проверки).
#   • Делегирует SQL-детали репозиторию ApplicationsRepo.
#   • Держит точку входа для роутеров: роутер говорит на языке Python-объектов,
#     а сервис уже решает, какие репозитории и методы вызвать.
# =============================================================================

from __future__ import annotations # Отложенная оценка аннотаций типов

from typing import Optional

from backend.repositories.applications import ApplicationsRepo # Репозиторий анкет (CRUD + поиск)
from backend.repositories.users import UsersRepo               # Репозиторий пользователей (на будущее: проверки и т.п.)


class ApplicationsService:
    """Сервисный слой для анкет."""

    def __init__(self) -> None:
        # Репозиторий анкет: отвечает за конкретные SQL-операции с таблицей application
        self.apps = ApplicationsRepo()
        # Репозиторий пользователей: можно использовать для дополнительных проверок
        # (например, существует ли пользователь, можно ли ему создавать анкеты и т.п.)
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
          • На 1 (hackathon_id, user_id) — только 1 анкета.

        Поведение:
          • Если анкета уже существует — поднимаем ValueError("app_exists").
            (Роутер маппит это в HTTP 409 Conflict.)
        """
        # 1) Проверяем, есть ли уже анкета этого пользователя на данном хакатоне.
        #    Это более человеко-понятная ошибка, чем просто ловить IntegrityError от БД.
        existing = await self.apps.get_by_user_and_hackathon(
            user_id=user_id, hackathon_id=hackathon_id
        )
        if existing:
            # Нарушение инварианта "одна анкета на (hackathon_id, user_id)"
            raise ValueError("app_exists")

        # 2) Создаём анкету через репозиторий (репо сам выставит дефолты status/joined).
        #    Здесь сервис только решает «можно или нельзя» и что передать дальше.
        return await self.apps.create(
            user_id=user_id,
            hackathon_id=hackathon_id,
            role=role,
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
          • role — точное совпадение роли (строка-Enum)
          • q    — username/first_name/last_name (case-insensitive поиск)

        Сервис пока просто делегирует репозиторию, но сюда удобно добавлять
        дополнительные проверки/правила (например, скрывать hidden-анкеты для чужих).
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

        Параметры:
          • app_id — идентификатор анкеты.
          • data   — словарь полей для изменения (например: {'role': 'Backend', 'status': 'hidden'}).

        Здесь можно добавлять бизнес-правила:
          • кто имеет право менять статус анкеты,
          • какие переходы статусов разрешены и т.п.
        """
        return await self.apps.update(app_id, data)

    # ---- ЧТЕНИЕ ----

    async def get(self, app_id: int):
        """Получить анкету по id (или None, если не найдена)."""
        return await self.apps.get_by_id(app_id)

    async def get_my_for_hackathon(self, user_id: int, hackathon_id: int):
        """
        Получить мою анкету на конкретный хакатон (или None).

        Удобный метод для роутов:
          • /hackathons/{hackathon_id}/applications/me
          • /me/applications/{hackathon_id}
        """
        return await self.apps.get_by_user_and_hackathon(
            user_id=user_id, hackathon_id=hackathon_id
        )

    async def list_my(self, user_id: int, limit: int = 50, offset: int = 0):
        """
        Список всех моих анкет по всем хакатонам (пагинированный).

        Используется для:
          • /me/applications — «мой портфель заявок» на разные мероприятия.
        """
        return await self.apps.search_by_user(
            user_id=user_id, limit=limit, offset=offset
        )
