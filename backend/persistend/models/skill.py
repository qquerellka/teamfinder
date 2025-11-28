from __future__ import annotations
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from sqlalchemy import Text, TIMESTAMP

from sqlalchemy.sql import func

from backend.persistend.base import Base, TimestampMixin


class Skill(Base, TimestampMixin):
    """
    ORM-модель для таблицы «skill».
    Каждая строка = один навык (например, slug="python", name="Python").
    TimestampMixin (родительский класс) добавит created_at/updated_at.
    """

    __tablename__ = "skill"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    slug: Mapped[str] = mapped_column(Text)

    name: Mapped[str] = mapped_column(Text)
