# =============================================================================
# ФАЙЛ: backend/persistend/models/users.py
# КРАТКО: ORM-модель таблицы "users" для SQLAlchemy.
# ЗАЧЕМ:
#   • Хранит учётные записи пользователей (включая telelgram_id и профиль).
#   • Даёт типобезопасный доступ к данным через ORM (вместо «сырого» SQL).
#   • Автоматически ведёт created_at/updated_at через TimestampMixin.
#
# КОНЦЕПТЫ (если вы впервые в бэкенде/БД):
#   • Модель — это Python-класс, описывающий таблицу и её столбцы.
#   • ORM сама строит SQL-запросы по вашим действиям с объектами класса.
#   • Первичный ключ (PK) — уникальный идентификатор строки (поле id).
# =============================================================================

from __future__ import annotations  # Разрешает отложенную оценку аннотаций типов (удобно для ORM и старых Python)

from sqlalchemy import BigInteger, Text, Integer            # Типы столбцов: BigInteger (для BIGINT/BIGSERIAL), Text — произвольной длины
from sqlalchemy.orm import Mapped, mapped_column, relationship   # Инструменты SQLAlchemy для декларативного описания полей модели

from backend.persistend.base import Base, TimestampMixin  # Наш общий Base и миксин с таймстемпами (created_at/updated_at)


# -----------------------------------------------------------------------------
# МОДЕЛЬ ТАБЛИЦЫ USERS
# -----------------------------------------------------------------------------
class User(Base, TimestampMixin):                 # Наследуемся от Base (регистрация в metadata) и миксина таймстемпов
    __tablename__ = "users"                       # Явно задаём имя таблицы в БД

    # id — первичный ключ. Используем BigInteger, чтобы совпадать с FK в user_skill (BigInteger там уже принят).
    # autoincrement=True — база сама проставляет следующее число (BIGSERIAL).
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # telegram_id — уникальный идентификатор пользователя в Telegram.
    # unique=True — запрет дубликатов; nullable=False — значение обязательно.
    telegram_id: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)

    # username и прочие поля профиля — обычные текстовые поля, которые могут отсутствовать (nullable=True по умолчанию).
    # В Telegram username может быть пустым — поэтому не делаем NOT NULL.
    username: Mapped[str | None] = mapped_column(Text)          # Ник в Telegram (может быть None)
    first_name: Mapped[str | None] = mapped_column(Text)        # Имя
    last_name: Mapped[str | None] = mapped_column(Text)         # Фамилия
    language_code: Mapped[str | None] = mapped_column(Text)     # Например: 'ru', 'en'
    bio: Mapped[str | None] = mapped_column(Text)               # Короткая биография
    avatar_url: Mapped[str | None] = mapped_column(Text)        # Ссылка на аватар
    city: Mapped[str | None] = mapped_column(Text)              # Город
    university: Mapped[str | None] = mapped_column(Text)        # Университет/ВУЗ
    link: Mapped[str | None] = mapped_column(Text)              # Личная/проф. ссылка (портфолио, сайт и т.п.)

    # Связь "один пользователь -> много анкет (Application)"
    applications = relationship(
        "Application",                # Модель, с которой связываемся (строкой, чтобы избежать проблем с порядком импорта)
        back_populates="user",        # Обратное поле в Application: там есть user = relationship("User", back_populates="applications")
        cascade="all, delete-orphan", # Каскад для ORM:
                                      #  • all — изменения/удаления пользователя прокидываются на его анкеты в сессии
                                      #  • delete-orphan — анкета удаляется,
                                      # если её убрать из user.applications и она больше ни к кому не привязана

        passive_deletes=True,         # Не трогать связанные анкеты в ORM при удалении пользователя —
                                      # доверяем БД и ON DELETE CASCADE в внешнем ключе (user_id)
    )

        # Команды, где пользователь — капитан
    captain_teams = relationship(
        "Team",
        back_populates="captain",
        cascade="all, delete-orphan",
        passive_deletes=True,
        foreign_keys="Team.captain_id",
    )

    # Все членства пользователя в командах
    team_memberships = relationship(
        "TeamMember",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    
    captain_teams = relationship(
        "Team",
        back_populates="captain",
        cascade="all, delete-orphan",
        passive_deletes=True,
        foreign_keys="Team.captain_id",
    )

    team_memberships = relationship(
        "TeamMember",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


