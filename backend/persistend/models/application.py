from __future__ import (
    annotations,
)

from sqlalchemy import Integer, Enum, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.persistend.base import (
    Base,
    TimestampMixin,
)
from backend.persistend.enums import (
    RoleType,
    ApplicationStatus,
)


class Application(Base, TimestampMixin):
    __tablename__ = "application"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    hackathon_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("hackathon.id", ondelete="CASCADE"),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    role: Mapped[RoleType | None] = mapped_column(
        Enum(RoleType, name="role_type"),
        nullable=True,
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.published,
        nullable=False,
    )

    joined: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="applications")

    hackathon = relationship("Hackathon", back_populates="applications")

    responses = relationship(
        "Response",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        UniqueConstraint("hackathon_id", "user_id", name="app_unique_per_hack"),
    )
