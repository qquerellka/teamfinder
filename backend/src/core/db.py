from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Асинхронный движок для подключения к базе данных
engine = create_async_engine(
    "postgresql+asyncpg://andreym1234:k7895123k@localhost:5432/teamfinder",
    echo=True,
)

# Объявление Base для всех моделей
Base = declarative_base()

# Сессия для работы с БД
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)

# Функция для получения сессии базы данных
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
