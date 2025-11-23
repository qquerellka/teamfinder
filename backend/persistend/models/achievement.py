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


# ---------------------------- PostgreSQL ENUM'ы ------------------------------

class RoleType(enum.Enum):
    # Дополните фактическими ролями из БД:
    Analytics = "Analytics"
    Backend = "Backend"
    Frontend = "Frontend"
    Design = "Design"
    PM = "PM"
    DS = "DS"
    QA = "QA"


class AchievPlace(enum.Enum):
    # Дополните при необходимости: finalist / prize / 1st / 2nd / 3rd и т.п.
    participant = "участие"
    firstPlace= "1",
    secondPlace = "2",
    thirdPlace = "3",
    finalyst = "финал"


# -------------------------------- Модель -------------------------------------

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

    place: Mapped[AchievPlace] = mapped_column(
        Enum(AchievPlace, name="achiev_place", create_type=False),
        nullable=False,
        server_default=text("'participant'::achiev_place"),
    )

    # Таймстемпы: created_at / updated_at — из TimestampMixin
