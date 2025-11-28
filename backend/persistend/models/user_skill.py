from __future__ import annotations

from sqlalchemy import Table, Column, Integer, ForeignKey, Index

from backend.persistend.base import Base

user_skill = Table(
    "user_skill",
    Base.metadata,
    Column(
        "user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "skill_id",
        Integer,
        ForeignKey("skill.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)

Index("ix_user_skill_skill_id", user_skill.c.skill_id)
