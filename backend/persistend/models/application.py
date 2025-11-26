# =============================================================================
# ФАЙЛ: backend/persistend/models/application.py
# КРАТКО: ORM-модель таблицы "application" для SQLAlchemy.
# ЗАЧЕМ:
#   • Хранит анкеты пользователей на хакатоны (одна анкета на (hackathon_id, user_id)).
#   • Фиксирует роль и статус видимости анкеты; факты вступления в команду.
#   • created_at/updated_at берём из TimestampMixin.
# =============================================================================

from __future__ import annotations # Разрешает отложенную оценку аннотаций типов (удобно для ORM и старых Python)

from sqlalchemy import ( # Импортируем типы колонок и ограничения 
    BigInteger, Enum, Boolean, ForeignKey, UniqueConstraint 
    # ForeignKey — внешний ключ
    # UniqueConstraint — ограничение уникальности на уровне таблицы
)
from sqlalchemy.orm import Mapped, mapped_column, relationship # Инструменты SQLAlchemy для декларативного описания полей модели

from backend.persistend.base import Base, TimestampMixin # Наш общий Base и миксин с таймстемпами (created_at/updated_at)
from backend.persistend.enums import RoleType, ApplicationStatus # Импорт enumов, которые маппятся на типы role_type и application_status в БД

# -----------------------------------------------------------------------------
# МОДЕЛЬ ТАБЛИЦЫ APPLICATION
# -----------------------------------------------------------------------------
class Application(Base, TimestampMixin): # Наследуемся от Base (регистрация в metadata) и миксина таймстемпов
    __tablename__ = "application"        # Явно задаём имя таблицы в БД

    
    # PK: уникальный идентификатор анкеты 
    # Mapped[int] — говорит SQLAlchemy: "это ORM-поле типа int"..
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    hackathon_id: Mapped[int] = mapped_column(
        BigInteger,  
        ForeignKey("hackathon.id", ondelete="CASCADE"), 
        # hackathon_id — внешний ключ на таблицу hackathon.id
        # ondelete="CASCADE" — если хакатон удалили, его анкеты тоже удаляются.
        nullable=False, 
        # nullable=False — анкета обязана относиться к какому-то хакатону
    )
    

    user_id: Mapped[int] = mapped_column(
        BigInteger,  
        ForeignKey("users.id", ondelete="CASCADE"),
        # user_id — внешний ключ на users.id
        # Если пользователя удалили — его анкеты тоже падают (CASCADE).
        nullable=False,
    )

    # Роль на хакатоне (Enum). Можно оставить nullable=True для "не выбрал"
    role: Mapped[RoleType | None] = mapped_column(
        Enum(RoleType, name="role_type"),
        # Здесь в БД будет колонка типа role_type (ENUM из 01_types.sql).
        # В коде — Python enum RoleType (Backend, Frontend и т.д.).
        nullable=True,
        # nullable=True — можно создать анкету без выбранной роли.
    )

    # Статус видимости анкеты
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status"),
        # Колонка типа application_status (ENUM draft/published/hidden).
        default=ApplicationStatus.published,  # не строка, а Enum-значение
        # По умолчанию — published (т.е. анкета видна другим).
        nullable=False,
        # nullable=False — статус обязателен.
    )

    # Факт вступления в команду
    joined: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # joined = False — по умолчанию человек ещё не в команде.


    # Связи (работают, только если в User/Hackathon задан back_populates!!!!)
    user = relationship("User", back_populates="applications")
    # Application.user -> объект User
    # В User ожидаем:
    # applications = relationship("Application", back_populates="user")

    hackathon = relationship("Hackathon", back_populates="applications")
    # Application.hackathon -> объект Hackathon
    # В Hackathon ожидаем:
    # applications = relationship("Application", back_populates="hackathon")

    responses = relationship(
        "Response",
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        # Одна анкета на (hackathon_id, user_id)
        UniqueConstraint("hackathon_id", "user_id", name="app_unique_per_hack"),
    )
    # На уровне БД: нельзя создать две анкеты одного и того же user’а на один и тот же hackathon.
 
