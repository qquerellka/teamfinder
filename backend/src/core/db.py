from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_async_engine(
    "postgresql+asyncpg://andreym1234:k7895123k@localhost:5432/teamfinder",
    echo=True,
)

Base = declarative_base()

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)

async def get_db():
    # Создаем сессию без контекста - будем управлять вручную
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()