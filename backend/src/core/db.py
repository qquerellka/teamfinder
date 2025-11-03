from sqlalchemy.ext.asyncio import create_async_engine
from src.core.config import settings

engine = create_async_engine(
    settings.database_url,  # Используем URL подключения из настроек
    future=True,
    pool_pre_ping=True,
)
