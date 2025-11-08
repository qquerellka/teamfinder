# Этот файл содержит определения для моделей SQLAlchemy.
# Модель User наследует от базового класса и описывает таблицу пользователей в базе данных.
# Включает в себя все необходимые поля и механизмы для работы с базой данных (например, автогенерация времени создания и обновления).

from __future__ import annotations
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column  # Для декларативного описания моделей
from sqlalchemy import BigInteger, Text, TIMESTAMP  # Для определения типов данных в таблице
from sqlalchemy.sql import func  # Для использования SQL-функций, например, для генерации времени на сервере
from backend.persistend.base import Base, TimestampMixin

# class Base(DeclarativeBase):
#     """Базовый класс для всех моделей SQLAlchemy. Предоставляет функциональность для создания таблиц."""
#     pass

# Модель пользователя, которая будет отображать таблицу "users" в базе данных
class User(Base, TimestampMixin):
    __tablename__ = "users"  # Имя таблицы в базе данных

    # Определение столбцов (полей) таблицы
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # ID пользователя, автоинкремент
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True)  # Уникальный telegram_id пользователя (тип BigInteger)

    # Дополнительные поля с типом Text (для строковых данных)
    username: Mapped[str | None] = mapped_column(Text)  # Имя пользователя (может быть пустым)
    first_name: Mapped[str | None] = mapped_column(Text)  # Имя
    last_name: Mapped[str | None] = mapped_column(Text)  # Фамилия
    language_code: Mapped[str | None] = mapped_column(Text)  # Языковой код (например, 'en', 'ru')
    bio: Mapped[str | None] = mapped_column(Text)  # Биография пользователя
    avatar_url: Mapped[str | None] = mapped_column(Text)  # URL аватара пользователя
    city: Mapped[str | None] = mapped_column(Text)  # Город
    university: Mapped[str | None] = mapped_column(Text)  # Университет
    link: Mapped[str | None] = mapped_column(Text)  # Личное или профессиональное ссылка (например, на профиль)

    # Время создания и последнего обновления записи
    # created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())  # Время создания (функция NOW() на сервере)
    # updated_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())  # Время последнего обновления (обновляется при изменении записи)
