# Этот файл содержит базовые классы для создания ORM-моделей с помощью SQLAlchemy.
# Включает базовый класс для всех моделей и миксин для добавления меток времени (создания и обновления строк).

from datetime import datetime  # Для работы с типом данных datetime
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column  # Для декларативного описания моделей
from sqlalchemy import func  # Для использования SQL-функций (например, NOW())

# Базовый класс для всех ORM-моделей
class Base(DeclarativeBase):
    """
    Базовый класс для всех ORM-моделей.
    Наследуя от этого класса, мы получаем декларативное описание таблиц.
    """

    # Метод для генерации имени таблицы по имени класса (преобразуем имя класса в нижний регистр)
    @declared_attr.directive
    def __tablename__(cls) -> str:
        """
        Генерация имени таблицы по имени класса.
        Пример:
          User        -> "user"
          LinkUsage   -> "linkusage"
        Можно также изменить на snake_case, если нужно:
          re.sub(r'(?<!^)(?=[A-Z])', '_', cls.__name__).lower()
        """
        return cls.__name__.lower()

# Миксин для добавления меток времени в модель
class TimestampMixin:
    """
    Миксин для добавления полей с метками времени.
    Просто добавь его в наследование модели: class User(TimestampMixin, Base): ...
    """

    # Время создания строки
    # default=func.now() — при вставке строки в БД подставляется текущее время БД
    created_at: Mapped[datetime] = mapped_column(
        default=func.now(),          # Вставка времени из БД при добавлении новой строки
        nullable=False,              # Поле обязательно
    )

    # Время последнего обновления строки
    # onupdate=func.now() — при любом обновлении строки будет автоматически проставляться текущее время БД
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(),          # Для первой вставки строки
        onupdate=func.now(),         # Для обновлений строки
        nullable=False,              # Поле обязательно
    )
