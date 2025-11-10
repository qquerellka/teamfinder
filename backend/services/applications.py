# =============================================================================
# ФАЙЛ: backend/services/applications.py
# КРАТКО: Сервис для работы с анкетами пользователей на хакатоны.
# ЗАЧЕМ:
#   • Создание анкеты для пользователя на хакатон.
#   • Поиск анкет по различным фильтрам.
#   • Обновление существующих анкет пользователей.
#   • Обеспечивает бизнес-логику для обработки анкет.
# ОСОБЕННОСТИ:
#   • Взаимодействует с репозиторием ApplicationsRepo.
#   • Логика поиска, фильтрации и создания анкет инкапсулирована в сервисе.
#   • Работает с моделью анкеты и дополнительной бизнес-логикой.
# =============================================================================

from backend.repositories.applications import ApplicationsRepo
from backend.repositories.users import UsersRepo
# from backend.repositories.hackathons import HackathonsRepo      ПОКА НЕ СОЗДАН!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

class ApplicationsService:
    """
    Сервис для работы с анкетами пользователей на хакатоны.
    Предоставляет методы для создания, поиска и обновления анкет.
    """

    def __init__(self):
        # Репозитории для работы с анкетами, пользователями и хакатонами
        self.applications_repo = ApplicationsRepo()
        self.users_repo = UsersRepo()
        self.hackathons_repo = HackathonsRepo()

    # ---- СОЗДАНИЕ АНКЕТЫ ----

    async def create(self, user_id: int, hackathon_id: int, role: str, title: str, about: str, city: str, skills: list[str]):
        """
        Создаёт анкету пользователя для конкретного хакатона.
        Параметры:
          user_id: ID пользователя, который создаёт анкету.
          hackathon_id: ID хакатона, для которого создаётся анкета.
          role: Роль пользователя на хакатоне (например, 'Backend', 'Frontend').
          title: Заголовок анкеты (например, название проекта или команды).
          about: Описание анкеты.
          city: Город пользователя.
          skills: Навыки, которые могут быть добавлены в анкету.
        """
        # Подготавливаем данные для создания анкеты
        data = {
            "role": role,
            "title": title,
            "about": about,
            "city": city,
            "skills": skills  # Список навыков для анкеты
        }
        # Передаем данные в репозиторий для создания анкеты
        return await self.applications_repo.create(hackathon_id, user_id, data)

    # ---- ПОИСК АНКЕТ ----

    async def search(self, hackathon_id: int, role: str = None, skills_any: list[str] = None, q: str = None, limit: int = 50, offset: int = 0):
        """
        Поиск анкет для хакатона с возможностью фильтрации по роли, навыкам и текстовому запросу.
        Параметры:
          hackathon_id: ID хакатона, для которого ищутся анкеты.
          role: Роль на хакатоне (опционально).
          skills_any: Список навыков, которые должны быть у пользователя (опционально).
          q: Текстовый запрос для поиска по анкете (опционально).
          limit: Ограничение на количество возвращаемых результатов (по умолчанию 50).
          offset: Смещение для пагинации (по умолчанию 0).
        """
        # Передаем запрос в репозиторий для поиска
        return await self.applications_repo.search(hackathon_id, role, skills_any, q, limit, offset)

    # ---- ОБНОВЛЕНИЕ АНКЕТЫ ----

    async def update(self, app_id: int, data: dict):
        """
        Обновление анкеты пользователя по её ID.
        Параметры:
          app_id: ID анкеты, которую нужно обновить.
          data: Данные для обновления анкеты (например, роль, описание, навыки).
        """
        # Передаем данные для обновления анкеты в репозиторий
        return await self.applications_repo.update(app_id, data)

    # ---- ПОЛУЧЕНИЕ АНКЕТЫ ----

    async def get(self, app_id: int):
        """
        Получение анкеты по ID.
        Параметры:
          app_id: ID анкеты, которую нужно получить.
        """
        # Запрашиваем анкету по ID через репозиторий
        return await self.applications_repo.get(app_id)
