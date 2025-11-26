# =============================================================================
# ФАЙЛ: backend/persistend/models/team.py
# КРАТКО: ORM модель таблицы team.
# =============================================================================

from __future__ import annotations
from typing import Optional, List

from sqlalchemy import Integer, Text, Boolean, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.persistend.base import Base, TimestampMixin
from backend.persistend.enums import TeamStatus


class Team(Base, TimestampMixin):
    __tablename__ = "team"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    hackathon_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("hackathon.id", ondelete="CASCADE"),
        nullable=False,
    )

    captain_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_private: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    status: Mapped[TeamStatus] = mapped_column(
        Enum(TeamStatus, name="team_status"),
        nullable=False,
        default=TeamStatus.forming,
    )

    # created_at / updated_at приходят из TimestampMixin и должны совпасть с DDL

    # --- связи ---

    hackathon = relationship(
        "Hackathon",
        back_populates="teams",
    )

    captain = relationship(
        "User",
        back_populates="captain_teams",
        foreign_keys=[captain_id],
    )

    members: Mapped[List["TeamMember"]] = relationship(
        "TeamMember",
        back_populates="team",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    vacancies: Mapped[List["Vacancy"]] = relationship(
        "Vacancy",
        back_populates="team",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    invites = relationship(
        "Invite",
        back_populates="team",
        cascade="all,delete-orphan",
    )

