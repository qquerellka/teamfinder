from __future__ import (
    annotations,
)

from sqlalchemy import (
    Text,
    Integer,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.persistend.base import (
    Base,
    TimestampMixin,
)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    username: Mapped[str | None] = mapped_column(Text)
    first_name: Mapped[str | None] = mapped_column(Text)
    last_name: Mapped[str | None] = mapped_column(Text)
    language_code: Mapped[str | None] = mapped_column(Text)
    bio: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(Text)
    university: Mapped[str | None] = mapped_column(Text)
    link: Mapped[str | None] = mapped_column(Text)

    applications = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    captain_teams = relationship(
        "Team",
        back_populates="captain",
        cascade="all, delete-orphan",
        passive_deletes=True,
        foreign_keys="Team.captain_id",
    )

    team_memberships = relationship(
        "TeamMember",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

