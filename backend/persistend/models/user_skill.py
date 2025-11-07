# Этот файл содержит описание таблицы связи между пользователями и их навыками.
# Используется для связи пользователей с их навыками в таблице "user_skill" (многие ко многим).
# Можно использовать как обычную таблицу для выполнения вставок и удалений, или как ORM-класс для удобства работы с SQLAlchemy.

from __future__ import annotations
from sqlalchemy import Table, Column, Integer, ForeignKey, MetaData  # Импортируем необходимые компоненты для работы с таблицами

metadata = MetaData()  # Создаем объект метаданных для определения таблиц

# Описание таблицы user_skill, которая представляет собой связь между пользователями и их навыками
user_skill = Table(
    "user_skill",  # Имя таблицы
    metadata,  # Метаданные, которые описывают схему таблицы
    # Столбец user_id: ссылается на поле id в таблице users. При удалении пользователя все его связи с навыками будут удалены (ondelete="CASCADE")
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    # Столбец skill_id: ссылается на поле id в таблице skill. При удалении навыка не будет удалять связи с пользователями (ondelete="RESTRICT")
    Column("skill_id", Integer, ForeignKey("skill.id", ondelete="RESTRICT"), primary_key=True),
)

# Альтернативная реализация, если хотите использовать ORM-класс для работы с таблицей
# В данном случае таблица user_skill может использоваться как обычная таблица для вставок и удалений данных, 
# или через класс UserSkill для ORM-подхода.

class UserSkill:
    __table__ = user_skill  # Связываем класс с таблицей user_skill
