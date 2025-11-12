# =============================================================================
# ФАЙЛ: backend/persistend/models/application.py
# КРАТКО: ORM-модель таблицы "application" для SQLAlchemy.
# ЗАЧЕМ:
#   • Хранит анкеты пользователей на хакатоны (одна анкета на (hackathon_id, user_id)).
#   • Фиксирует роль и статус видимости анкеты; факты вступления в команду.
#   • created_at/updated_at берём из TimestampMixin.
# =============================================================================

from __future__ import annotations

from sqlalchemy import (
    Integer, BigInteger, Enum, Boolean, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.persistend.base import Base, TimestampMixin
from backend.persistend.enums import RoleType, ApplicationStatus


class Application(Base, TimestampMixin):
    __tablename__ = "application"

    # ВАЖНО: выбери тип в соответствии с реальными DDL.
    # Если users.id/hackathon.id = SERIAL/INT -> Integer;
    # если BIGSERIAL -> BigInteger. Я оставляю Integer как у тебя в DDL.
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    hackathon_id: Mapped[int] = mapped_column(
        Integer,  # или BigInteger, если в DDL BIGSERIAL
        ForeignKey("hackathon.id", ondelete="CASCADE"),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,  # или BigInteger, если в DDL BIGSERIAL
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Роль на хакатоне (Enum). Можно оставить nullable=True для "не выбрал"
    role: Mapped[RoleType | None] = mapped_column(
        Enum(RoleType, name="role_type"),
        nullable=True,
    )

    # Статус видимости анкеты
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.published,  # не строка, а Enum-значение
        nullable=False,
    )

    # Факт вступления в команду
    joined: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Связи (работают, только если в User/Hackathon задан back_populates!!!!!)
    user = relationship("User", back_populates="applications", lazy="joined")
    hackathon = relationship("Hackathon", back_populates="applications", lazy="joined")

    __table_args__ = (
        # Одна анкета на (hackathon_id, user_id)
        UniqueConstraint("hackathon_id", "user_id", name="app_unique_per_hack"),
    )
