# =============================================================================
# ФАЙЛ: backend/presentations/app.py
# КРАТКО: создаёт и настраивает объект FastAPI.
# ЗАЧЕМ:
#   • Включает CORS (какие фронтенды могут стучаться к API).
#   • Добавляет middleware для измерения времени обработки запроса.
#   • Подключает роутеры (system, auth, users).
#   • На старте пингует БД (init_db), на выключении корректно закрывает пул (dispose_db).
# КОМУ ПОЛЕЗНО:
#   • Точка входа в приложение — сюда заглядывают, чтобы понять, какие части API доступны
#     и какая инициализация выполняется при запуске.
# =============================================================================

from __future__ import annotations  # Современные аннотации типов (отложенная оценка — удобнее для импорта)
import time                         # Замер времени обработки запросов
from fastapi import FastAPI, Request               # FastAPI-приложение и объект запроса
from fastapi.middleware.cors import CORSMiddleware # CORS-мидлварь (контроль доступа со сторонних доменов)
from backend.settings.config import settings       # Настройки приложения (имя, версия, CORS-источники и т.п.)
from backend.infrastructure.db import init_db, dispose_db  # Инициализация/закрытие подключения к БД
from backend.presentations.routers.system import router as system_router
from backend.presentations.routers.auth import router as auth_router
from backend.presentations.routers.users import router as users_router
from backend.presentations.routers.achievements import router as achievements_router
from backend.presentations.routers.hackathons import router as hack_router
from backend.presentations.routers.applications import router as applications_router
from backend.presentations.routers.teams import router as teams_router
from backend.presentations.routers.vacancies import router as vacancies_router



# Фабрика приложения: создаёт и возвращает настроенный экземпляр FastAPI
def create_app() -> FastAPI:
    """
    Собираем объект FastAPI: заголовки, CORS, middleware, роутеры, хуки старта/остановки.
    Возвращаем готовый app, который запускается uvicorn'ом.
    """
    # Заголовки приложения берём из настроек (с дефолтами)
    app = FastAPI(
        title=getattr(settings, "APP_NAME", "MiniApp API"),
        version=getattr(settings, "APP_VERSION", "0.1.0"),
    )
    
    allowed_origins = settings.CORS_ORIGINS_LIST

    # CORS — кто может обращаться к API из браузера.
    # В dev часто ставят "*", в prod — конкретные домены фронтенда.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,  # Разрешённые источники (список строк)
        allow_credentials=True,   # Разрешаем cookies/авторизационные заголовки
        allow_methods=["*"],      # Разрешаем любые HTTP-методы (GET/POST/PUT/DELETE/...)
        allow_headers=["*"],      # Разрешаем любые заголовки
    )

    # Простая middleware: измеряем время обработки запроса и кладём в заголовок ответа
    @app.middleware("http")
    async def add_timing(request: Request, call_next):
        t0 = time.perf_counter()          # Стартовая отметка
        resp = await call_next(request)   # Передаём управление следующему обработчику в цепочке
        # Добавляем заголовок с временем обработки в миллисекундах (удобно для отладки/метрик)
        resp.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - t0) * 1000:.2f}"
        return resp

    # Подключаем роутеры — это «разделы» API
    app.include_router(system_router)       # /system/*
    app.include_router(auth_router)         # /auth/*
    app.include_router(users_router)        # /users/*
    app.include_router(achievements_router) # /achievements/*
    app.include_router(hack_router)         # /hackathons/*
    app.include_router(applications_router) # /hackathons/{id}/applications, /me/applications
    app.include_router(teams_router)        # /hackathons/{id}/teams, /teams/*
    app.include_router(vacancies_router) # /hackathons/{id}/teams, /teams/{id}, /teams/{id}/members
    
    
    # Хук старта приложения: проверяем доступность БД (health-ping)
    @app.on_event("startup")
    async def _startup():
        await init_db()

    # Хук остановки приложения: корректно закрываем пул соединений к БД
    @app.on_event("shutdown")
    async def _shutdown():
        await dispose_db()

    return app
