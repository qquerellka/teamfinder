# =============================================================================
# ФАЙЛ: backend/persistend/base.py
# КРАТКО: общий базовый класс ORM (Base) + миксин TimestampMixin с полями
#         created_at/updated_at. Подключается всеми моделями SQLAlchemy.
# ЗАЧЕМ:
#   • Base регистрирует ваши модели в общей metadata (нужно для миграций/создания таблиц).
#   • __tablename__ по умолчанию формирует имя таблицы из имени класса.
#   • TimestampMixin автоматически добавляет метки времени создания/обновления.
# ОСОБЕННОСТИ:
#   • TIMESTAMP(timezone=True) → хранит время с таймзоной (рекомендуется).
#   • server_default/ onupdate с func.now() → время выставляет сама БД (надёжно).
#   • Если в модели задать свой __tablename__, он переопределит поведение Base.
# =============================================================================

from datetime import datetime  # Стандартный тип для дат/времени в Python

# DeclarativeBase — "база" для всех моделей; declared_attr — для вычисляемых атрибутов (как __tablename__)
# Mapped/mapped_column — типизированное описание колонок в стиле SQLAlchemy 2.0
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column

# TIMESTAMP — тип столбца "дата/время" в БД; func — доступ к SQL-функциям (например, now())
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
        """
        Автоматическое имя таблицы: берём имя класса и делаем нижний регистр.
        Примеры:
          User        -> "user"
          LinkUsage   -> "linkusage"

        Если хотите snake_case (user_profile -> user_profile), можно заменить на:
            import re
            return re.sub(r'(?<!^)(?=[A-Z])', '_', cls.__name__).lower()
        Или указывать __tablename__ явно в каждой модели — это перекрывает базовое правило.
        """
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

    # created_at — время создания строки.
    # TIMESTAMP(timezone=True) — явный тип: "время с таймзоной" (в Postgres это TIMESTAMPTZ).
    # server_default=func.now() — значение проставляет СУБД при вставке (надёжно и единообразно).
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),  # тип столбца с таймзоной
        server_default=func.now(), # DEFAULT now() на стороне БД
        nullable=False,            # поле обязательно
    )

    # updated_at — время последнего обновления строки.
    # server_default=func.now() — при первой вставке будет то же самое, что created_at.
    # onupdate=func.now() — при UPDATE ORM попросит БД проставить текущее время.
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),  # тип столбца с таймзоной
        server_default=func.now(), # DEFAULT now() при вставке
        onupdate=func.now(),       # автоподстановка now() при изменении строки
        nullable=False,            # поле обязательно
    )
