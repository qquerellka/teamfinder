from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, Enum as SAEnum, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from persistend.base import Base, CreatedAtMixin
from persistend.enums import InviteStatus, RoleType


class Invite(Base, CreatedAtMixin):
    __tablename__ = "invite"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    team_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("team.id", ondelete="CASCADE"),
        nullable=False,
    )

    application_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("application.id", ondelete="CASCADE"),
        nullable=False,
    )

    invited_role: Mapped[RoleType] = mapped_column(
        SAEnum(RoleType, name="role_type"),
        nullable=False,
    )

    status: Mapped[InviteStatus] = mapped_column(
        SAEnum(InviteStatus, name="invite_status"),
        nullable=False,
        default=InviteStatus.pending,
    )

    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    team = relationship("Team", back_populates="invites")
    application = relationship("Application", back_populates="invites")
