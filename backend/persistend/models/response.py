# =============================================================================
# ФАЙЛ: backend/persistend/models/response.py
# КРАТКО: ORM модель таблицы response (отклик на вакансию).
# =============================================================================

from __future__ import annotations

from sqlalchemy import Integer, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.persistend.base import Base, TimestampMixin
from backend.persistend.enums import ResponseStatus, RoleType


class Response(Base, TimestampMixin):
    __tablename__ = "response"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    vacancy_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vacancy.id", ondelete="CASCADE"),
        nullable=False,
    )

    application_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("application.id", ondelete="CASCADE"),
        nullable=False,
    )

    desired_role: Mapped[RoleType] = mapped_column(
        SAEnum(RoleType, name="role_type"),
        nullable=False,
        default=RoleType.Analytics,  # совпадает с DEFAULT 'Analytics'
    )

    status: Mapped[ResponseStatus] = mapped_column(
        SAEnum(ResponseStatus, name="response_status"),
        nullable=False,
        default=ResponseStatus.pending,
    )

    vacancy = relationship("Vacancy", back_populates="responses")
    application = relationship("Application", back_populates="responses")
