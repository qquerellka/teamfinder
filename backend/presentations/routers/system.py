from __future__ import annotations
from fastapi import APIRouter
from sqlalchemy import text
from backend.infrastructure.db import get_engine
from backend.settings.config import settings

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health")
async def health():
    """
    Liveness-проба: проверяет, что приложение запущено и отвечает.
    Никаких внешних зависимостей (БД/кеш) здесь нет — просто "жив/не жив".
    """
    return {"status": "ok"}


@router.get("/version")
async def version():
    """
    Возвращает версию сервиса из настроек.
    Полезно для диагностики, логов деплоя и отображения в UI.
    """
    return {"version": getattr(settings, "APP_VERSION", "0.1.0")}


@router.get("/ready")
async def ready():
    """
    Readiness-проба: проверяет готовность сервиса обрабатывать запросы.
    Критерий готовности — есть соединение к БД и SELECT 1 выполняется без ошибок.
    """
    engine = get_engine()
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    return {"ready": True}
