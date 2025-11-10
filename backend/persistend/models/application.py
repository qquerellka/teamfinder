# =============================================================================
# ФАЙЛ: backend/persistend/models/application.py
# КРАТКО: ORM-модель таблицы "application" для SQLAlchemy.
# ЗАЧЕМ:
#   • Хранит анкеты пользователей на хакатоны.
#   • Связывает пользователей с хакатонами и позволяет отслеживать их роли и статус.
#   • Позволяет работать с данными анкеты через ORM (без прямых SQL-запросов).
#
# КОНЦЕПТЫ:
#   • Модель — это Python-класс, описывающий таблицу и её столбцы.
#   • ORM строит SQL-запросы по действиям с объектами класса.
#   • Первичный ключ (PK) — уникальный идентификатор строки (поле id).
# =============================================================================

from __future__ import annotations  # Разрешает отложенную оценку аннотаций типов

from sqlalchemy.ext.declarative import declarative_base  # Импортируем declarative_base
from sqlalchemy import Column, Integer, Enum, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.persistend.enums import RoleType, ApplicationStatus  # Импортируем Enums для ролей и статусов
from backend.persistend.base import TimestampMixin  # Миксин для работы с created_at/updated_at

class Application(Base, TimestampMixin):  # Наследуемся от Base и TimestampMixin
    __tablename__ = "application"  # Имя таблицы в БД

    # id — первичный ключ. Используем BigInteger для уникальных значений.
    id = Column(Integer, primary_key=True, autoincrement=True)

    # hackathon_id — связь с хакатоном (ссылается на таблицу хакатонов).
    hackathon_id = Column(Integer, ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    # user_id — связь с пользователем (ссылается на таблицу пользователей).
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    role = Column(Enum(RoleType, name="role_type"), nullable=True) # роль пользователя на хакатоне
    status = Column(Enum(ApplicationStatus, name="application_status"), default="published", nullable=False) # статус анкеты
    joined = Column(Boolean, default=False, nullable=False) # флаг, указывающий, вступил ли пользователь в команду на хакатоне

    # skills — список навыков пользователя на хакатоне. Используется тип массива для хранения.
    skills = Column(Text, default="[]", nullable=False)

    # created_at — время создания анкеты.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False) #время создания анкеты
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False) #время последнего обновления анкеты

    # Связь с пользователем (один пользователь может иметь множество анкет).
    user = relationship("User", back_populates="applications")
    # Связь с хакатоном (анкету можно привязать только к одному хакатону).
    hackathon = relationship("Hackathon", back_populates="applications")


    # Пояснение:
    # 1. id: Уникальный идентификатор анкеты, автоинкрементируемое значение.
    # 2. hackathon_id: Идентификатор хакатона, к которому привязана анкета (ссылается на таблицу hackathon).
    # 3. user_id: Идентификатор пользователя, создавшего анкету (ссылается на таблицу users).
    # 4. role: Роль пользователя на хакатоне (например, 'backend', 'frontend', и т.д.).
    # 5. status: Статус анкеты. Может быть 'published' (опубликована) или 'hidden' (скрыта).
    # 6. joined: Флаг, показывающий, присоединился ли пользователь к команде хакатона.
    # 7. title: Заголовок анкеты (необязательное поле).
    # 8. about: Описание анкеты (необязательное поле).
    # 9. city: Город пользователя (необязательное поле).
    # 10. skills: Список навыков, которые указал пользователь для анкеты.
    # 11. created_at: Время создания анкеты.
    # 12. updated_at: Время последнего обновления анкеты.
    # 13. Связи с пользователем (user) и хакатоном (hackathon), которые позволяют работать с этими объектами.
