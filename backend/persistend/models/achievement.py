# =============================================================================
# ФАЙЛ: backend/persistend/models/achievement.py
# КРАТКО: ORM-модель таблицы "achievements".
# ЗАЧЕМ:
#   • Хранит достижения пользователей по хакатонам (роль и место).
#   • Даёт типобезопасный доступ к данным через ORM.
#   • created_at/updated_at — из TimestampMixin.
#
# ПРИМЕЧАНИЯ:
#   • В БД уже существуют ENUM-типы: role_type, achiev_place.
#     Поэтому Enum(..., create_type=False) — типы не создаём, только ссылаемся.
#   • Значения enum-ов ниже — пример. Приведите к вашему фактическому списку.
# =============================================================================

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Integer, ForeignKey, Enum, DateTime, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.persistend.base import Base, TimestampMixin
from backend.persistend.enums import RoleType, AchievementPlace

class Achievement(Base, TimestampMixin):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    hackathon_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("hackathon.id", ondelete="CASCADE"),
        nullable=False,
    )

    role: Mapped[RoleType] = mapped_column(
        Enum(RoleType, name="role_type", create_type=False),
        nullable=False,
    )

    place: Mapped[AchievementPlace] = mapped_column(
        Enum(AchievementPlace, name="achiev_place", create_type=False),
        nullable=False,
        server_default=text("'participant'::achiev_place"),
    )
