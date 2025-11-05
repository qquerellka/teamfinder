# Импортируем необходимые компоненты из SQLAlchemy для асинхронной работы
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Создаем подключение к бд (движок)
engine = create_async_engine(
    "postgresql+asyncpg://andreym1234:k7895123k@localhost:5432/teamfinder",
    # Включить вывод SQL запросов в консоль (для отладки)
    echo=True,
)
# Базовый класс для всех моделей
Base = declarative_base()

# Фабрика для создания сессий бд
AsyncSessionLocal = sessionmaker(
    # Привязываем к нашему движку
    bind=engine,
    # Используем асинхронные сессии
    class_=AsyncSession,
    # Отключаем автоматическую синхронизацию
    autoflush=False,
    # Отключаем expire после коммита (для асинхронности)
    expire_on_commit=False,
)

# Функция для получения сессии бд, поставщик
async def get_db():
    # Создаем сессию без контекста - будем управлять вручную
    session = AsyncSessionLocal()
    try:
        # Отдаем сессию вызывающему коду (например, эндпоинту FastAPI)
        yield session
    finally:
        # Гарантируем закрытие сессии в любом случае (даже при ошибках)
        await session.close()