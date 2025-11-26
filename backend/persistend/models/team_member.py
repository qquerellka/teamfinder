from datetime import datetime
from sqlalchemy import Integer, Boolean, TIMESTAMP, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.persistend.base import Base
from backend.persistend.enums import RoleType


class TeamMember(Base):
    __tablename__ = "team_member"

    team_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("team.id", ondelete="CASCADE"),
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    role: Mapped[RoleType] = mapped_column(
        SAEnum(RoleType, name="role_type"),
        nullable=False,
    )

    is_captain: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    joined_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=func.now(),  # <<< ДЕФОЛТ на уровне ORM
    )

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")
