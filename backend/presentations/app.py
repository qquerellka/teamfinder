from __future__ import annotations

import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.settings.config import settings
from backend.infrastructure.db import init_db, dispose_db
from backend.presentations.routers.system import router as system_router
from backend.presentations.routers.auth import router as auth_router
from backend.presentations.routers.users import router as users_router
from backend.presentations.routers.achievements import router as achievements_router
from backend.presentations.routers.hackathons import router as hack_router
from backend.presentations.routers.applications import router as applications_router
from backend.presentations.routers.teams import router as teams_router
from backend.presentations.routers.vacancies import router as vacancies_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=getattr(settings, "APP_NAME", "MiniApp API"),
        version=getattr(settings, "APP_VERSION", "0.1.0"),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS_LIST,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def add_timing(request: Request, call_next):
        t0 = time.perf_counter()
        resp = await call_next(request)
        resp.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - t0) * 1000:.2f}"
        return resp

    # роутеры
    app.include_router(system_router)
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(achievements_router)
    app.include_router(hack_router)
    app.include_router(applications_router)
    app.include_router(teams_router)
    app.include_router(vacancies_router)

    @app.on_event("startup")
    async def _startup():
        await init_db()

    @app.on_event("shutdown")
    async def _shutdown():
        await dispose_db()

    return app
