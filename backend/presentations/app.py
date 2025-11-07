# Этот файл содержит функцию для создания и настройки приложения FastAPI.
# Включает конфигурацию для CORS, обработку времени запросов, инициализацию базы данных и подключение роутеров для разных частей API.

from __future__ import annotations
import time  # Для измерения времени обработки запросов
from fastapi import FastAPI, Request  # Импортируем FastAPI для создания приложения и Request для обработки запросов
from fastapi.middleware.cors import CORSMiddleware  # Для добавления CORS middleware
from backend.settings.config import settings  # Импортируем настройки из конфигурации
from backend.infrastructure.db import init_db, dispose_db  # Функции для инициализации и очистки базы данных
from backend.presentations.routers.system import router as system_router  # Роутер для системных API
from backend.presentations.routers.auth import router as auth_router  # Роутер для аутентификации
from backend.presentations.routers.users import router as users_router  # Роутер для пользователей

# Функция для создания экземпляра FastAPI с необходимыми настройками
def create_app() -> FastAPI:
    # Создаем экземпляр FastAPI с заголовками title и version, которые берутся из настроек
    app = FastAPI(title=getattr(settings, "APP_NAME", "MiniApp API"), version=getattr(settings, "APP_VERSION", "0.1.0"))

    # Добавляем CORS middleware для настройки CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=getattr(settings, "CORS_ORIGINS_LIST", ["*"]),  # Разрешенные источники (из настроек или по умолчанию все)
        allow_credentials=True,  # Разрешаем передачу cookies
        allow_methods=["*"],  # Разрешаем все методы HTTP
        allow_headers=["*"],  # Разрешаем все заголовки
    )

    # Middleware для измерения времени обработки запроса
    @app.middleware("http")
    async def add_timing(request: Request, call_next):
        t0 = time.perf_counter()  # Запоминаем время начала обработки
        resp = await call_next(request)  # Обрабатываем запрос
        # Добавляем заголовок с временем обработки запроса в миллисекундах
        resp.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - t0)*1000:.2f}"
        return resp

    # Подключаем роутеры для разных частей API
    app.include_router(system_router)  # Роутер для системных API
    app.include_router(auth_router)  # Роутер для аутентификации
    app.include_router(users_router)  # Роутер для пользователей

    # Функция для инициализации базы данных при старте приложения
    @app.on_event("startup")
    async def _startup(): 
        await init_db()  # Инициализация базы данных

    # Функция для очистки базы данных при завершении работы приложения
    @app.on_event("shutdown")
    async def _shutdown(): 
        await dispose_db()  # Очищаем соединения с базой данных

    # Возвращаем созданное приложение FastAPI
    return app
