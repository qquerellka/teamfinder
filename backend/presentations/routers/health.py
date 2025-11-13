"""
Системные эндпоинты сервиса:
- /health  → признак «жив ли процесс»
- /version → имя/версия/окружение приложения

ЗАМЕТКА:
Роутер подключаем в app.py с префиксом /system:
    app.include_router(health_router, prefix="/system")
→ в итоге урлы будут: /system/health и /system/version
"""

from typing import Literal
from fastapi import APIRouter
from pydantic import BaseModel

from backend.settings.config import settings  # единый источник правды для имени/версии/окружения

# Создаём роутер и помечаем тегом "system" — так методы соберутся в один блок в Swagger.
router = APIRouter(tags=["system"])


# =========================
# Схемы (модели) ответов
# =========================
class HealthResponse(BaseModel):
    status: Literal["ok"]  # фиксированное значение — удобно для проверок в k8s/compose

class VersionResponse(BaseModel):
    name: str
    version: str
    env: str


# =========================
# Эндпоинты
# =========================
@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness probe (жив ли процесс)",
)
async def health() -> HealthResponse:
    """
    Простейшая проверка «жив ли процесс».
    НИЧЕГО не трогаем: ни БД, ни внешние сервисы — только подтверждаем, что приложение отвечает.
    """
    return HealthResponse(status="ok")


@router.get(
    "/version",
    response_model=VersionResponse,
    summary="Версия приложения и окружение",
)
async def version() -> VersionResponse:
    """
    Полезно для быстрой диагностики и отображения версии на фронте.
    """
    return VersionResponse(name=settings.APP_NAME, version=settings.APP_VERSION, env=settings.APP_ENV)


# =========================
# (Опционально) Readiness-проба
# Раскомментируй, если хочешь проверять доступность БД и готовность сервиса
# =========================
# from fastapi import Response, status
# from sqlalchemy import text
# from backend.infrastructure.db import get_session
#
# @router.get("/ready", summary="Readiness probe (готов ли сервис)")
# async def ready():
#     try:
#         async with get_session() as s:
#             await s.execute(text("select 1"))  # проверяем доступность БД
#         return Response(status_code=status.HTTP_204_NO_CONTENT)
#     except Exception:
#         return Response(status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
