# =============================================================================
# ФАЙЛ: backend/presentations/routers/system.py
# КРАТКО: системные эндпоинты для мониторинга сервиса.
# ЗАЧЕМ:
#   • /system/health  — «жив ли процесс» (liveness probe), не трогает БД.
#   • /system/version — отдать версию приложения (для дебага/релизов).
#   • /system/ready   — «готов ли обслуживать трафик» (readiness probe), пингует БД.
# ПРИМЕЧАНИЕ:
#   • /ready считает сервис готовым, если есть соединение с БД и простейший запрос проходит.
#   • Эти ручки удобно использовать в оркестраторах (Docker, Kubernetes) и в мониторинге.
# =============================================================================

from __future__ import annotations  # Позволяет использовать аннотации типов без раннего разрешения ссылок (удобно и современно)

from fastapi import APIRouter       # Роутер FastAPI — группируем эндпоинты в модуль
from sqlalchemy import text         # text() — для простого «сырого» SQL вроде SELECT 1
from backend.infrastructure.db import get_engine  # Наш общий engine к БД (пул соединений)
from backend.settings.config import settings      # Настройки приложения (версия и т.п.)

# Создаём роутер с префиксом /system и тегом "system" (красиво в Swagger/Redoc)
router = APIRouter(prefix="/system", tags=["system"])

@router.get("/health")
async def health():
    """
    Liveness-проба: проверяет, что приложение запущено и отвечает.
    Никаких внешних зависимостей (БД/кеш) здесь нет — просто "жив/не жив".
    """
    return {"status": "ok"}  # Если код 200 и {status: ok}, значит процесс жив

@router.get("/version")
async def version():
    """
    Возвращает версию сервиса из настроек.
    Полезно для диагностики, логов деплоя и отображения в UI.
    """
    # getattr(...) — берём APP_VERSION из настроек, если нет — подставляем "0.1.0"
    return {"version": getattr(settings, "APP_VERSION", "0.1.0")}

@router.get("/ready")
async def ready():
    """
    Readiness-проба: проверяет готовность сервиса обрабатывать запросы.
    Критерий готовности — есть соединение к БД и SELECT 1 выполняется без ошибок.
    """
    engine = get_engine()                 # Берём общий engine (управляет пулом соединений к БД)
    async with engine.connect() as conn:  # Открываем соединение из пула
        await conn.execute(text("SELECT 1"))  # Простейший запрос: если он не упадёт — БД ок
    return {"ready": True}                # Если тут — значит всё хорошо
