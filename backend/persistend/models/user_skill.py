# =============================================================================
# ФАЙЛ: backend/persistend/models/user_skill.py
# КРАТКО: таблица-связка many-to-many между пользователями и навыками.
# ЗАЧЕМ:
#   • Позволяет одному пользователю иметь несколько навыков,
#     и одному навыку принадлежать многим пользователям.
#   • Хранит только пары (user_id, skill_id) — «кто какой навык имеет».
# ОСНОВНЫЕ МОМЕНТЫ:
#   • Композитный первичный ключ (user_id, skill_id) — запрещает дубли.
#   • FK на users.id с ON DELETE CASCADE — при удалении пользователя
#     его связи с навыками очищаются автоматически.
#   • FK на skill.id с ON DELETE RESTRICT — нельзя удалить навык,
#     если он кем-то используется (это защищает справочник навыков).
#   • Индекс по skill_id — ускоряет выборки «все пользователи с навыком X».
# ПРИМЕЧАНИЕ ПО ТИПАМ:
#   • Если id в таблицах users/skill — BIGINT (BIGSERIAL), используйте BigInteger.
#     Если там обычный SERIAL/INTEGER — замените BigInteger на Integer.
# =============================================================================

from __future__ import annotations

# Table/Column — декларативное создание таблицы без ORM-класса
# ForeignKey — внешний ключ для связей с другими таблицами
# Index — отдельный индекс для ускорения частых выборок
from sqlalchemy import Table, Column, Integer, ForeignKey, Index

# Base — общий объект metadata для всех таблиц/моделей проекта
from backend.persistend.base import Base

# -----------------------------------------------------------------------------
# ТАБЛИЦА-СВЯЗКА user_skill (many-to-many между users и skill)
# -----------------------------------------------------------------------------
user_skill = Table(
    "user_skill",            # Имя таблицы в БД
    Base.metadata,           # Общая metadata: регистрирует таблицу в схеме проекта

    # user_id — ссылка на users.id.
    # primary_key=True делает его частью составного первичного ключа.
    # ondelete="CASCADE" — при удалении пользователя автоматически удаляются его связи.
    Column(
        "user_id",
        Integer,          # Используем BigInteger, чтобы совпадать с BIGSERIAL/BIGINT в users.id
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    ),

    # skill_id — ссылка на skill.id.
    # ondelete="RESTRICT" — не даём удалить навык, если он где-то используется.
    Column(
        "skill_id",
        Integer,          # Аналогично: под BIGSERIAL/BIGINT в skill.id
        ForeignKey("skill.id", ondelete="RESTRICT"),
        primary_key=True
    ),
)

# Дополнительный индекс: ускоряет запросы вида «дай всех пользователей с навыком X».
# Почему отдельный индекс нужен?
#   PK по (user_id, skill_id) создаёт B-Tree индекс по этому порядку столбцов.
#   Он хорош для фильтрации по user_id и паре (user_id, skill_id),
#   но не оптимален для фильтрации только по skill_id.
Index("ix_user_skill_skill_id", user_skill.c.skill_id)
