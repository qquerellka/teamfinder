# Этот файл отвечает за подключение к БД в асинхронном режиме (SQLAlchemy).
# Содержит:
#  - создание async engine и фабрики сессий;
#  - зависимость get_session() с автокоммитом/роллбеком транзакции;
#  - init_db() — быстрая проверка доступности БД (health/ready);
#  - dispose_db() — корректное закрытие пула соединений при остановке приложения.

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from backend.settings.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,                 # проверять соединение перед выдачей из пула
    pool_size=settings.DB_POOL_SIZE,    # размер пула соединений
    max_overflow=settings.DB_MAX_OVERFLOW,  # «переполнение» сверх пула при пиках
)

# Фабрика асинхронных сессий (expire_on_commit=False — объекты остаются «живыми» после commit)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость для FastAPI: выдаёт сессию на время запроса.
    При успехе — commit, при исключении — rollback.
    """
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

async def init_db() -> None:
    """
    Лёгкая проверка доступности БД на старте приложения.
    """
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))

async def dispose_db() -> None:
    """
    Корректно закрыть пул соединений при завершении работы приложения.
    """
    await engine.dispose()
