# =============================================================================
# ФАЙЛ: backend/presentations/routers/achievements.py
# КРАТКО: роутер FastAPI для обновления/удаления достижений.
# ЧТО ОСТАЛОСЬ ЗДЕСЬ:
#   • PATCH /achievements/{id}
#   • DELETE /achievements/{id}
# Списки и создание достижений переехали в /users/* (users.py).
# =============================================================================

from __future__ import annotations

from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    status,
)
from pydantic import BaseModel

from backend.persistend.models import achievement as m_ach
from backend.services.achievements import AchievementsService
from backend.presentations.routers.users import get_current_user_id


router = APIRouter(prefix="/achievements", tags=["achievements"])
ach_service = AchievementsService()


# ---- Схемы ----


class AchievementOut(BaseModel):
    id: int
    user_id: int
    hackathon_id: int
    role: m_ach.RoleType
    place: m_ach.AchievementPlace


class AchievementUpdateIn(BaseModel):
    role: Optional[m_ach.RoleType] = None
    place: Optional[m_ach.AchievementPlace] = None


# ---- Роуты ----


@router.patch("/{achievement_id}", response_model=AchievementOut)
async def update_achievement(
    achievement_id: int = Path(..., ge=1),
    payload: AchievementUpdateIn = ...,
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Обновить роль/место достижения по id.
    (Проверку, что current_user_id == owner, при необходимости можно добавить в сервис.)
    """
    ach = await ach_service.update(
        ach_id=achievement_id,
        role=payload.role,
        place=payload.place,
    )
    if not ach:
        raise HTTPException(status_code=404, detail="achievement not found")

    return AchievementOut(
        id=ach.id,
        user_id=ach.user_id,
        hackathon_id=ach.hackathon_id,
        role=ach.role,
        place=ach.place,
    )


@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_achievement(
    achievement_id: int = Path(..., ge=1),
    _current_user_id: int = Depends(get_current_user_id),
):
    """
    Удалить достижение по id.
    """
    ok = await ach_service.delete(achievement_id)
    if not ok:
        raise HTTPException(status_code=404, detail="achievement not found")
    # 204 No Content
    return None
