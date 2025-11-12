# =============================================================================
# ФАЙЛ: backend/persistend/models/hackathon.py
# КРАТКО: ORM-модель таблицы "hackathon".
# ЗАЧЕМ:
#   • Хранит карточку хакатона (даты, режим, статус, город и т.д.).
#   • Даёт связь One-to-Many с анкетами (Application).
# ОСОБЕННОСТИ:
#   • Enum-колонки мапятся на SQL ENUM'ы с именами: hackathon_mode, hackathon_status.
#   • Типы согласованы с твоим DDL (INTEGER/SERIAL).
# =============================================================================

from __future__ import annotations
from sqlalchemy import Integer, Text, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.persistend.base import Base, TimestampMixin


class Hackathon(Base, TimestampMixin):
    __tablename__ = "hackathon"

    # PK
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Основные поля
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    image_link: Mapped[str | None] = mapped_column(Text)

    # Даты
    start_date: Mapped = mapped_column(DateTime, nullable=False)
    end_date: Mapped = mapped_column(DateTime, nullable=False)
    registration_end_date: Mapped | None = mapped_column(DateTime)

    # Enum'ы — должны совпасть по ИМЕНАМ и НАБОРАМ ЗНАЧЕНИЙ с твоими DDL-типами
    mode: Mapped[str] = mapped_column(
        Enum("online", "offline", "hybrid", name="hackathon_mode"),
        nullable=False,
        default="online",
    )
    status: Mapped[str] = mapped_column(
        Enum("draft", "open", "closed", name="hackathon_status"),
        nullable=False,
        default="open",
    )

    # Прочее
    city: Mapped[str | None] = mapped_column(Text)
    team_members_minimum: Mapped[int | None] = mapped_column(Integer)
    team_members_limit: Mapped[int | None] = mapped_column(Integer)
    registration_link: Mapped[str | None] = mapped_column(Text)
    prize_fund: Mapped[str | None] = mapped_column(Text)

    # Связи (замкнётся на Application.hackathon = relationship(..., back_populates="applications"))
    applications = relationship("Application", back_populates="hackathon", lazy="noload")
