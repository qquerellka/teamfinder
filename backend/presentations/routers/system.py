# Этот файл содержит системные эндпоинты для проверки состояния приложения.
# Включает роуты для проверки работоспособности API, получения версии приложения и проверки готовности соединения с базой данных.

from __future__ import annotations
from fastapi import APIRouter, Depends  # Для создания роутера и зависимостей
from sqlalchemy.ext.asyncio import AsyncSession  # Для работы с асинхронной сессией SQLAlchemy
from sqlalchemy import text  # Для выполнения произвольных SQL-запросов
from backend.infrastructure.db import get_session  # Для получения сессии с базой данных
from backend.settings.config import settings  # Для доступа к настройкам (например, версия приложения)

router = APIRouter(prefix="/system", tags=["system"])  # Создаем роутер с префиксом "/system"

# Эндпоинт для проверки работоспособности API
@router.get("/health")
async def health():
    return {"status": "ok"}  # Возвращает статус "ok", чтобы показать, что API работает

# Эндпоинт для получения версии приложения
@router.get("/version")
async def version():
    # Возвращает версию приложения, взятую из настроек (если есть), иначе по умолчанию "0.1.0"
    return {"version": settings.APP_VERSION if hasattr(settings, "APP_VERSION") else "0.1.0"}

# Эндпоинт для проверки готовности базы данных
@router.get("/ready")
async def ready(session: AsyncSession = Depends(get_session)):
    # Выполняет простой SQL-запрос для проверки подключения к базе данных
    await session.execute(text("SELECT 1"))
    return {"ready": True}  # Возвращает "ready": True, если соединение с базой данных установлено
