# Этот файл описывает модель для таблицы "skill", которая будет хранить информацию о навыках.
# Модель использует SQLAlchemy ORM для работы с базой данных и автоматически управляет временем создания и обновления записей.

from __future__ import annotations
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column  # Для создания ORM-моделей и работы с колонками
from sqlalchemy import Text, TIMESTAMP  # Для использования типов данных в таблицах
from sqlalchemy.sql import func  # Для использования SQL-функций, таких как NOW()
from backend.persistend.base import Base, TimestampMixin
# Базовый класс для всех моделей SQLAlchemy, от него должны наследоваться другие модели
# class Base(DeclarativeBase):
#     """Базовый класс для всех ORM-моделей"""
#     pass

# Модель для таблицы "skill", которая будет хранить информацию о навыках
class Skill(Base, TimestampMixin):
    __tablename__ = "skill"  # Имя таблицы в базе данных

    # Определение столбцов таблицы
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # ID навыка, автоинкремент
    slug: Mapped[str] = mapped_column(Text)  # Слаг (короткое название) для уникальной идентификации
    name: Mapped[str] = mapped_column(Text)  # Название навыка
    # created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())  # Время создания
    # updated_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())  # Время последнего обновления
