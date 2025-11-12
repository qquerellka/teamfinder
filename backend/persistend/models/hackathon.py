# =============================================================================
# ФАЙЛ: backend/persistend/models/hackathon.py
# КРАТКО: ORM-модель "hackathon" (SQLAlchemy 2.x, Mapped / mapped_column).
# =============================================================================

from __future__ import annotations
from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, DateTime, Enum

from backend.persistend.base import Base, TimestampMixin
from backend.persistend.enums import HackathonMode, HackathonStatus  # см. твой enums.py

class Hackathon(Base, TimestampMixin):
    __tablename__ = "hackathon"

    # PK
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Основные поля
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Даты (с таймзоной)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    registration_end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Прочее
    mode: Mapped[HackathonMode] = mapped_column(Enum(HackathonMode, name="hackathon_mode"), nullable=False, default=HackathonMode.online)
    city: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    team_members_minimum: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    team_members_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    registration_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prize_fund: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[HackathonStatus] = mapped_column(Enum(HackathonStatus, name="hackathon_status"), nullable=False, default=HackathonStatus.open)

    # <<< NEW
    applications = relationship(
        "Application",
        back_populates="hackathon",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
