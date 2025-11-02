# src/core/db.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from src.core.config import settings

engine = create_async_engine(
    settings.database_url,  # postgresql+asyncpg://...
    future=True,
    pool_pre_ping=True,
)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, autoflush=False, expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

# зависимость под fastapi/или просто convenience
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
