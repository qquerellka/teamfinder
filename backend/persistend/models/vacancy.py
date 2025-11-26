# =============================================================================
# ФАЙЛ: backend/persistend/models/vacancy.py
# КРАТКО: ORM модель таблицы vacancy.
# =============================================================================

from __future__ import annotations
from typing import Optional, List

from sqlalchemy import Integer, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.persistend.base import Base, TimestampMixin
from backend.persistend.enums import RoleType, VacancyStatus


class Vacancy(Base, TimestampMixin):
    __tablename__ = "vacancy"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    team_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("team.id", ondelete="CASCADE"),
        nullable=False,
    )

    role: Mapped[RoleType] = mapped_column(
        SAEnum(RoleType, name="role_type"),
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # JSONB массив навыков (по ТЗ пока это тех. поле)
    skills: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    status: Mapped[VacancyStatus] = mapped_column(
        SAEnum(VacancyStatus, name="vacancy_status"),
        nullable=False,
        default=VacancyStatus.open,
    )

    team = relationship("Team", back_populates="vacancies")

    responses: Mapped[List["Response"]] = relationship(
        "Response",
        back_populates="vacancy",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
