# Этот файл реализует репозиторий для работы с таблицей "skill" в базе данных.
# Репозиторий предоставляет методы для получения навыков по их slug-ам и упрощает работу с базой данных через SQLAlchemy.

from __future__ import annotations
from typing import Sequence, Mapping  # Для аннотаций типов, Sequence - это последовательность элементов, Mapping - отображение (словарь)
from sqlalchemy.ext.asyncio import AsyncSession  # Для работы с асинхронной сессией SQLAlchemy
from sqlalchemy import select  # Для выполнения SQL-запросов
from backend.persistend.models import skill as m_skill  # Импорт модели "skill" из базы данных

# Репозиторий для работы с навыками
class SkillsRepo:
    def __init__(self, s: AsyncSession):
        self.s = s  # Инициализация сессии для работы с базой данных, передается объект AsyncSession

    # Метод для получения навыков по их slug-ам
    async def map_by_slugs(self, slugs: Sequence[str]) -> Mapping[str, m_skill.Skill]:
        # Формируем SQL-запрос для получения всех навыков с переданными slug-ами
        q = select(m_skill.Skill).where(m_skill.Skill.slug.in_(slugs))
        
        # Выполняем запрос и извлекаем результаты, используя scalars().all(), чтобы получить все найденные навыки
        skills = (await self.s.execute(q)).scalars().all()
        
        # Возвращаем результаты в виде словаря, где ключ - это slug навыка, а значение - сам объект навыка
        return {s.slug: s for s in skills}
