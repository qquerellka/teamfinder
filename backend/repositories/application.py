# =============================================================================
# ФАЙЛ: backend/repositories/application.py
# КРАТКО: Репозиторий для работы с анкетами пользователей на хакатоны.
# ЗАЧЕМ:
#   • Обеспечивает работу с базой данных для операций с анкетами.
#   • Реализует методы для создания анкеты, поиска анкет по различным фильтрам,
#     и обновления существующих анкет.
#   • Использует SQLAlchemy для работы с таблицей анкет.
#
# ОСОБЕННОСТИ:
#   • Репозиторий работает через сессии с БД и инкапсулирует логику работы с таблицей "application".
#   • Все операции с данными (создание, обновление, поиск) выполняются через асинхронные сессии.
# =============================================================================

from __future__ import annotations  # Для отложенной оценки аннотаций типов (удобно для ORM)

from typing import Optional, List, Tuple  # Аннотации типов для коллекций

from sqlalchemy import select, update, delete  # SQLAlchemy: select-запросы, обновление, удаление
from sqlalchemy.orm import Session  # Сессии для работы с БД
from backend.persistend.models import application as m_application  # Модель для анкеты
from backend.persistend.models import users as m_users  # Модель для пользователей

from backend.repositories.base import BaseRepository  # Базовый репозиторий для работы с сессиями

class ApplicationsRepo(BaseRepository):
    """Репозиторий для работы с анкетами пользователей на хакатоны."""

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, app_id: int) -> Optional[m_application.Application]:
        """
        Получение анкеты по ID.
        Использует метод get для поиска анкеты по первичному ключу.
        """
        async with self._sm() as s:  # Открытие сессии на время операции
            return await s.get(m_application.Application, app_id)  # Получаем анкету по ID

    async def get_by_user_and_hackathon(self, user_id: int, hackathon_id: int) -> Optional[m_application.Application]:
        """
        Получение анкеты пользователя на конкретный хакатон.
        Проверяет наличие анкеты для пользователя на заданном хакатоне.
        """
        async with self._sm() as s:
            stmt = (
                select(m_application.Application)
                .where(m_application.Application.user_id == user_id)
                .where(m_application.Application.hackathon_id == hackathon_id)
            )
            result = await s.execute(stmt)
            return result.scalars().first()  # Возвращаем первую найденную анкету или None

    async def search(self, hackathon_id: int, role: Optional[str] = None, skills: Optional[List[str]] = None,
                     limit: int = 50, offset: int = 0) -> List[m_application.Application]:
        """
        Поиск анкет для заданного хакатона с фильтрацией по роли и навыкам.
        Возвращает список анкет для хакатона с возможностью фильтрации по роли и навыкам.
        """
        async with self._sm() as s:
            stmt = select(m_application.Application).where(m_application.Application.hackathon_id == hackathon_id)
            if role:
                stmt = stmt.where(m_application.Application.role == role)
            if skills:
                # Тут добавляем логику для поиска по навыкам. Для простоты пока фильтруем только по роли.
                pass

            # Пагинация
            stmt = stmt.limit(limit).offset(offset)
            result = await s.execute(stmt)
            return result.scalars().all()  # Возвращаем список всех найденных анкет

    # ---------- ЗАПИСЬ ----------

    async def create(self, user_id: int, hackathon_id: int, role: str, title: Optional[str], about: Optional[str], city: Optional[str], skills: Optional[List[str]]) -> m_application.Application:
        """
        Создание анкеты для пользователя на хакатон.
        Принимает данные анкеты (роль, заголовок, описание и т.д.) и сохраняет в базе.
        """
        async with self._sm() as s:
            # Создаем новую анкету
            new_application = m_application.Application(
                user_id=user_id,
                hackathon_id=hackathon_id,
                role=role,
                title=title,
                about=about,
                city=city,
                skills=skills or [],  # Если навыки не переданы, создаём пустой список
            )
            s.add(new_application)  # Добавляем анкету в сессию
            await s.commit()  # Подтверждаем изменения в базе
            await s.refresh(new_application)  # Обновляем объект в памяти
            return new_application

    # ---------- ОБНОВЛЕНИЕ ----------

    async def update(self, app_id: int, data: dict) -> Optional[m_application.Application]:
        """
        Обновление анкеты по её ID.
        Обновляются только переданные данные.
        """
        async with self._sm() as s:
            stmt = update(m_application.Application).where(m_application.Application.id == app_id).values(data)
            result = await s.execute(stmt)
            await s.commit()
            if result.rowcount == 0:  # Если анкету не нашли по ID
                return None
            return await self.get_by_id(app_id)  # Возвращаем обновлённую анкету

    # ---------- УДАЛЕНИЕ ----------

    async def delete(self, app_id: int) -> bool:
        """
        Удаление анкеты по её ID.
        """
        async with self._sm() as s:
            stmt = delete(m_application.Application).where(m_application.Application.id == app_id)
            result = await s.execute(stmt)
            await s.commit()
            return result.rowcount > 0  # Возвращаем True, если удаление прошло успешно
