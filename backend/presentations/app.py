import time
from fastapi import FastAPI, Request, Response, status, Path, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.user_service import UserService
from utils.telegram_parser import parse_telegram_link
from schemas.user_schema import UserUpdateSchema
from typing import Callable, Awaitable
from loguru import logger

app = FastAPI(
    title="TeamFinder API",
    description="API for managing user profiles and Telegram integration"
)

user_service = UserService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    t0 = time.time()
    response = await call_next(request)
    elapsed_ms = round((time.time() - t0) * 1000, 2)
    response.headers["X-Latency"] = str(elapsed_ms)

    route_path = request.scope.get("route")
    if route_path:
        logger.debug("{} {} done in {}ms", request.method, route_path.path, elapsed_ms)
    else:
        logger.debug("{} [UNKNOWN_ROUTE] done in {}ms", request.method, elapsed_ms)

    return response

@app.patch("/user/update")
async def update_user(user_data: UserUpdateSchema):
    telegram_user = parse_telegram_link(str(user_data.tg_link))
    tg_data = {
        "telegram_id": telegram_user["id"],
        "username": telegram_user.get("username"),
        "name": telegram_user.get("name"),
        "surname": telegram_user.get("surname"),
        "avatar_url": None,
        "bio": user_data.bio,
        "age": user_data.age,
        "city": user_data.city,
        "university": user_data.university,
        "link": user_data.link,
        "skills": user_data.skills
    }

    user = await user_service.upsert_user_from_telegram(tg_data)
    return {"status": "ok", "updated": user}

@app.get("/user/{telegram_id}/check")
async def check_user(telegram_id: int):
    return await user_service.check_user_by_telegram_id(telegram_id)

@app.get("/user/list")
async def get_all_users():
    return await user_service.get_all_users()

@app.get("/ping")
def ping():
    return {"status": "ok"}
