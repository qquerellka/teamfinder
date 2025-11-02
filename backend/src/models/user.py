from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy import BigInteger, Integer, Text, func
from datetime import datetime
from typing import Any, Dict, List, Optional

from src.core.db import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "teamfinder"}   # <<-- НОВАЯ СХЕМА

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False)

    username: Mapped[Optional[str]] = mapped_column(Text)
    name: Mapped[Optional[str]] = mapped_column(Text)
    surname: Mapped[Optional[str]] = mapped_column(Text)
    language_code: Mapped[Optional[str]] = mapped_column(Text)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text)

    age: Mapped[Optional[int]] = mapped_column(Integer)
    city: Mapped[Optional[str]] = mapped_column(Text)
    university: Mapped[Optional[str]] = mapped_column(Text)

    skills: Mapped[List[Any]] = mapped_column(JSONB, default=list)
    soft_skills: Mapped[List[Any]] = mapped_column(JSONB, default=list)
    achievements: Mapped[List[Any]] = mapped_column(JSONB, default=list)
    portfolio_link: Mapped[Optional[str]] = mapped_column(Text)
    links: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    bio: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
