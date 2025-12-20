from __future__ import annotations

from sqlalchemy import Integer, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from persistend.base import Base, TimestampMixin
from persistend.enums import ResponseStatus


class Response(Base, TimestampMixin):
    __tablename__ = "response"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    vacancy_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vacancy.id", ondelete="CASCADE"),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    status: Mapped[ResponseStatus] = mapped_column(
        SAEnum(ResponseStatus, name="response_status"),
        nullable=False,
        default=ResponseStatus.pending,
    )

    # связи
    vacancy = relationship("Vacancy", back_populates="responses")
    user = relationship("User", back_populates="responses")
