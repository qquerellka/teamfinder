# ЭТОТ ФАЙЛ НЕ ИСПОЛЬЗУЕТСЯ НИГДЕ!!!
# =============================================================================
# ФАЙЛ: backend/repositories/skills.py
# КРАТКО: репозиторий для работы со справочником навыков (таблица skill).
# ЗАЧЕМ:
#   • Давать удобные методы чтения/поиска навыков из БД через ORM.
#   • Прятать детали работы с сессиями: репозиторий сам открывает/закрывает сессию.
# ОСОБЕННОСТИ:
#   • Метод map_by_slugs(slugs) возвращает словарь {slug -> Skill}.
#   • Нормализуем входные slug'и (strip + lower) и убираем дубликаты.
#   • Пустой вход → пустой словарь (без лишних запросов к БД).
# ПРЕДПОСЫЛКИ:
#   • В модели Skill.slug желательно unique + индекс (это ускорит выборки).
#   • Репозитории наследуются от BaseRepository и берут sessionmaker из инфраструктуры.
# =============================================================================

from __future__ import annotations  # Отложенная оценка аннотаций типов — удобно для ORM-типов

from typing import Sequence, Mapping, Dict  # Аннотации: последовательности и отображения (dict-подобные)
from sqlalchemy import select              # Конструктор SELECT-запросов SQLAlchemy 2.0

from backend.repositories.base import BaseRepository  # База репозиториев: даёт self.session()/self.transaction()
from backend.persistend.models.skill import Skill     # ORM-модель таблицы "skill"

class SkillsRepo(BaseRepository):
    """
    Репозиторий для чтения данных о навыках.

    Наследуемся от BaseRepository:
      • не принимаем AsyncSession снаружи;
      • открываем краткоживущую сессию «на операцию» через self.session().
    """

    async def map_by_slugs(self, slugs: Sequence[str]) -> Mapping[str, Skill]:
        """
        Вернуть словарь {slug -> Skill} по списку slug'ов.

        Поведение:
          • Нормализуем вход: берём только непустые строки, обрезаем пробелы и приводим к lower().
          • Убираем дубликаты (работаем с set).
          • Если после нормализации ничего не осталось — сразу возвращаем {}.
          • Делаем один запрос: SELECT * FROM skill WHERE slug IN (:slugs...)
          • Собираем результат в словарь по фактическим slug из БД.

        Пример:
            repo = SkillsRepo()
            mapping = await repo.map_by_slugs([" Python ", "docker", "python"])
            # mapping может быть: {"python": <Skill ...>, "docker": <Skill ...>}
        """
        # Нормализуем входные данные:
        #  - s and s.strip() отсеивает пустые/None
        #  - .strip() убирает пробелы
        #  - .lower() делает регистр единым (если slug хранится в нижнем регистре)
        norm_slugs = {s.strip().lower() for s in slugs if s and s.strip()}
        if not norm_slugs:
            return {}

        # Открываем новую сессию на время операции чтения.
        # Коммит не нужен — мы ничего не изменяем.
        async with self.session() as session:
            # Строим SELECT: берём все навыки, чей slug входит в нормализованный набор
            stmt = select(Skill).where(Skill.slug.in_(norm_slugs))

            # Выполняем запрос. scalars() достаёт «чистые» ORM-объекты (без кортежей).
            result = await session.execute(stmt)
            skills = result.scalars().all()

        # Собираем {slug -> Skill}. Берём slug из объектов БД (а не из входа) — так точнее.
        mapping: Dict[str, Skill] = {obj.slug: obj for obj in skills}
        return mapping
