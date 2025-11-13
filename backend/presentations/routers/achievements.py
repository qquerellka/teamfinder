# =============================================================================
# ФАЙЛ: backend/presentations/routers/achievements.py
# КРАТКО: роутер FastAPI для работы с достижениями пользователей.
# ЗАЧЕМ:
#   • CRUD по достижениям (создание/обновление/удаление).
#   • Списки достижений: мои, любого пользователя, по хакатону.
#   • Агрегаты по хакатону (пример: распределение по place).
# ОСОБЕННОСТИ:
#   • Авторизация по JWT (как в users.py): достаём user_id из Bearer-токена.
#   • Репозиторий AchievementsRepo сам открывает асинхронные сессии per-operation.
#   • Ответы — Pydantic-модели. Пагинация как в /users/search (items/total/limit/offset).
# =============================================================================

from __future__ import annotations

import os
from typing import Optional, List

from fastapi import (
    APIRouter, Depends, HTTPException, Header, Query, Path, status
)
from pydantic import BaseModel, Field

from backend.repositories.achievements import AchievementsRepo
from backend.utils import jwt_simple
from backend.persistend.models import achievement as m_ach

router = APIRouter(prefix="/achievements", tags=["achievements"])
ach_repo = AchievementsRepo()

# ---- Аутентификация (JWT -> user_id) ----

async def get_current_user_id(authorization: str | None = Header(default=None)) -> int:
    """
    Достаём user_id из заголовка Authorization: Bearer <JWT>.
    Совместимо по поведению с роутером users.py.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt_simple.decode(token, os.getenv("JWT_SECRET", "dev-secret-change-me"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")
    return int(payload["sub"])

# ---- Схемы (Pydantic) ----

class AchievementOut(BaseModel):
    id: int
    user_id: int
    hackathon_id: int
    role: m_ach.RoleType
    place: m_ach.AchievPlace

class AchievementCreateIn(BaseModel):
    hackathon_id: int
    role: m_ach.RoleType
    # если не задано — репозиторий поставит participant
    place: Optional[m_ach.AchievPlace] = None

class AchievementUpsertIn(BaseModel):
    hackathon_id: int
    role: Optional[m_ach.RoleType] = None
    place: Optional[m_ach.AchievPlace] = None

class AchievementUpdateIn(BaseModel):
    role: Optional[m_ach.RoleType] = None
    place: Optional[m_ach.AchievPlace] = None

# ---- Хелперы упаковки ----

def _pack_many(items: List[m_ach.Achievement]) -> List[dict]:
    """Сериализация ORM в DTO."""
    return [
        AchievementOut(
            id=a.id,
            user_id=a.user_id,
            hackathon_id=a.hackathon_id,
            role=a.role,
            place=a.place,
        ).model_dump()
        for a in items
    ]

# ---- Роуты: мои достижения ----

@router.get("/me", response_model=dict)
async def list_my_achievements(
    role: Optional[m_ach.RoleType] = Query(default=None),
    place: Optional[m_ach.AchievPlace] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Список моих достижений с фильтрами по роли/месту.
    Пагинация: items/total/limit/offset.
    """
    items, total = await ach_repo.list_by_user(
        current_user_id, role=role, place=place, limit=limit, offset=offset
    )
    return {"items": _pack_many(items), "total": total, "limit": limit, "offset": offset}

# ---- Роуты: по пользователю ----

@router.get("/user/{user_id}", response_model=dict)
async def list_user_achievements(
    user_id: int = Path(..., ge=1),
    role: Optional[m_ach.RoleType] = Query(default=None),
    place: Optional[m_ach.AchievPlace] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user_id: int = Depends(get_current_user_id),
):
    """
    Список достижений произвольного пользователя.
    Требует валидный JWT, но не требует, чтобы user_id совпадал с субъктом токена.
    """
    items, total = await ach_repo.list_by_user(
        user_id, role=role, place=place, limit=limit, offset=offset
    )
    return {"items": _pack_many(items), "total": total, "limit": limit, "offset": offset}

# ---- Роуты: по хакатону ----

# @router.get("/hackathons/{hack_id}", response_model=dict)
# async def list_hackathon_achievements(
#     hack_id: int = Path(..., ge=1),
#     role: Optional[m_ach.RoleType] = Query(default=None),
#     place: Optional[m_ach.AchievPlace] = Query(default=None),
#     limit: int = Query(default=20, ge=1, le=100),
#     offset: int = Query(default=0, ge=0),
#     _current_user_id: int = Depends(get_current_user_id),
# ):
#     """
#     Список достижений по хакатону.
#     """
#     items, total = await ach_repo.list_by_hackathon(
#         hack_id, role=role, place=place, limit=limit, offset=offset
#     )
#     return {"items": _pack_many(items), "total": total, "limit": limit, "offset": offset}

# @router.get("/hackathons/{hack_id}/stats/place", response_model=dict)
# async def stats_by_place(
#     hack_id: int = Path(..., ge=1),
#     _current_user_id: int = Depends(get_current_user_id),
# ):
#     """
#     Агрегат: распределение достижений по place в рамках конкретного хакатона.
#     """
#     rows = await ach_repo.stats_by_place_for_hack(hack_id)
#     items = [{"place": place.value if isinstance(place, m_ach.AchievPlace) else str(place), "count": cnt}
#              for place, cnt in rows]
#     return {"items": items, "hack_id": hack_id}

# ---- CRUD ----

@router.post("", response_model=AchievementOut, status_code=status.HTTP_201_CREATED)
async def create_achievement(payload: AchievementCreateIn, current_user_id: int = Depends(get_current_user_id)):
    try:
        ach = await ach_repo.create(
            user_id=current_user_id,
            hackathon_id=payload.hackathon_id,
            role=payload.role,
            place=payload.place or m_ach.AchievPlace.participant,
        )
    except ValueError as e:
        if str(e) == "duplicate_achievement":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "duplicate_achievement"})
        if str(e).startswith("integrity_error:"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"error": "integrity_error"})
        raise HTTPException(status_code=400, detail=str(e))
    return AchievementOut(
        id=ach.id, user_id=ach.user_id, hackathon_id=ach.hackathon_id, role=ach.role, place=ach.place
    )


# @router.post("/upsert", response_model=AchievementOut)
# async def upsert_achievement(
#     payload: AchievementUpsertIn,
#     current_user_id: int = Depends(get_current_user_id),
# ):
#     """
#     Идемпотентно создать/обновить достижение по паре (current_user_id, hack_id).
#     Если запись есть — обновятся переданные поля role/place.
#     """
#     try:
#         ach = await ach_repo.upsert_for_user_hack(
#             user_id=current_user_id,
#             hack_id=payload.hack_id,
#             role=payload.role,
#             place=payload.place,
#         )
#     except ValueError as e:
#         msg = str(e)
#         if msg.startswith("invalid_args:"):
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"error": "invalid_args"})
#         if msg.startswith("integrity_error:"):
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"error": "integrity_error"})
#         raise HTTPException(status_code=400, detail=str(e))
#     return AchievementOut(
#         id=ach.id, user_id=ach.user_id, hack_id=ach.hack_id, role=ach.role, place=ach.place
#     )

@router.patch("/{achievement_id}", response_model=AchievementOut)
async def update_achievement(
    achievement_id: int = Path(..., ge=1),
    payload: AchievementUpdateIn = ...,
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Обновить роль/место достижения. (Авторство по user_id тут не проверяется — добавьте,
    если нужна проверка владения ресурсом.)
    """
    ach = await ach_repo.update(achievement_id, role=payload.role, place=payload.place)
    if not ach:
        raise HTTPException(status_code=404, detail="achievement not found")
    return AchievementOut(
        id=ach.id, user_id=ach.user_id, hackathon_id=ach.hackathon_id, role=ach.role, place=ach.place
    )

@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_achievement(
    achievement_id: int = Path(..., ge=1),
    _current_user_id: int = Depends(get_current_user_id),
):
    """
    Удалить достижение по id. (Проверку авторства можно добавить при необходимости.)
    """
    ok = await ach_repo.delete_by_id(achievement_id)
    if not ok:
        raise HTTPException(status_code=404, detail="achievement not found")
    return None
