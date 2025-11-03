# Импортируем необходимые типы данных для столбцов, TIMESTAMP - для временных меток
from sqlalchemy import Column, Integer, String, BigInteger, JSON, TIMESTAMP
# Импортирует фуннкции SQL из SQLAlchemy (func.now() для получения текущего времени сервера БД)
from sqlalchemy.sql import func
# Импортирует базовый класс Base из локального модуля,
# который обычно инициализируется через declarative_base() и используется для создания моделей
from src.core.db import Base

class User(Base):
    __tablename__ = "users"

    # primary_key=True - указывает что это первичный ключ, autoincrement=True - автоматическое увеличение значения
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    #unique=True - гарантирует уникальность значений, nullable=False - запрещает пустые значения
    telegram_id = Column(BigInteger, unique=True, nullable=False)
    username = Column(String, nullable=True)
    name = Column(String, nullable=True)
    surname = Column(String, nullable=True)
    language_code = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    city = Column(String, nullable=True)
    university = Column(String, nullable=True)
    link = Column(String, default="") 
    # Создает столбец для ссылок в формате JSON, по умолчанию пустой словарь.
    skills = Column(JSON, default=[])  
    # TIMESTAMP(timezone=True) - временная метка с часовым поясом
    # server_default=func.now() - значение по умолчанию (текущее время сервера БД)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    # onupdate=func.now() - автоматическое обновление при изменении записи
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
