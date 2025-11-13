from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import os

# Для SQLite используем async версию
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./hackathons.db")

engine = create_async_engine(
    DATABASE_URL,
    echo=True  # Логирование SQL запросов
)

AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def create_tables():
    from backend.persistent.models.hackathon import Hackathon
    from backend.persistent.base import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)