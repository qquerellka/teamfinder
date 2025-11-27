from datetime import datetime

from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column

from sqlalchemy import TIMESTAMP, func


# ----------------------------- БАЗОВЫЙ КЛАСС ------------------------------
class Base(DeclarativeBase):
    """
    Базовый класс для всех ORM-моделей.
    Наследование от него регистрирует модель в общей metadata (схеме проекта).
    """

    # __tablename__ — имя таблицы в БД. declared_attr позволяет вычислять его на уровне класса-наследника.
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


# ----------------------------- МИКСИН ВРЕМЕНИ -----------------------------
class TimestampMixin:
    """
    Миксин добавляет в модель два поля:
      • created_at — когда строка создана
      • updated_at — когда строка в последний раз изменена
    Как использовать:
      class User(Base, TimestampMixin): ...
    """


    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False,
    )
