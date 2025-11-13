# =============================================================================
# ФАЙЛ: backend/persistend/models/hackathon.py
# КРАТКО: ORM-модель таблицы "hackathon" для SQLAlchemy.
# ЗАЧЕМ:
#   • Хранит карточки хакатонов с датами, режимом проведения и статусом.
#   • Даёт типобезопасный доступ к данным через ORM вместо «сырого» SQL.
#   • created_at/updated_at — через TimestampMixin (см. Base).
#
# ПРИМЕЧАНИЯ:
#   • PostgreSQL-ENUM'ы 'hackathon_mode' и 'hackathon_status' уже есть в БД,
#     поэтому Enum(..., create_type=False) — не пытаемся создавать тип заново.
#   • id = SERIAL в DDL → в модели используем Integer + autoincrement=True.
#     Если в проекте FK ожидают BIGINT, поменяйте на BigInteger/BIGSERIAL.
# =============================================================================

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Text, Enum, DateTime, text

from backend.persistend.base import Base, TimestampMixin


# ---------------------------- PostgreSQL ENUM'ы ------------------------------

class HackathonMode(enum.Enum):
    online = "online"
    offline = "offline"
    hybrid = "hybrid"


class HackathonStatus(enum.Enum):
    draft = "draft"
    open = "open"
    closed = "closed"


# ------------------------------- Модель --------------------------------------

class Hackathon(Base, TimestampMixin):
    __tablename__ = "hackathon"

    # PK: SERIAL → Integer + autoincrement
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Обязательные поля
    name: Mapped[str] = mapped_column(Text, nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Необязательные поля
    description: Mapped[str | None] = mapped_column(Text)
    image_link: Mapped[str | None] = mapped_column(Text)
    registration_end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    city: Mapped[str | None] = mapped_column(Text)
    team_members_minimum: Mapped[int | None] = mapped_column(Integer)
    team_members_limit: Mapped[int | None] = mapped_column(Integer)
    registration_link: Mapped[str | None] = mapped_column(Text)
    prize_fund: Mapped[str | None] = mapped_column(Text)

    # ENUM-поля (используем уже существующие типы в БД)
    mode: Mapped[HackathonMode] = mapped_column(
        Enum(HackathonMode, name="hackathon_mode", create_type=False),
        nullable=False,
        server_default=text("'online'::hackathon_mode"),
    )

    status: Mapped[HackathonStatus] = mapped_column(
        Enum(HackathonStatus, name="hackathon_status", create_type=False),
        nullable=False,
        server_default=text("'open'::hackathon_status"),
    )

    # created_at / updated_at приходят из TimestampMixin
