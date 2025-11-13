# =============================================================================
# ФАЙЛ: backend/presentations/routers/hackathons.py
# КРАТКО: Роутер FastAPI для хакатонов.
# ЗАЧЕМ:
#   • Позволяет фронту получать список открытых хакатонов и деталь по id.
#   • Схемы (Pydantic) описаны прямо в роутере (как ты делаешь в users.py).
# ОСОБЕННОСТИ:
#   • JWT не обязателен для чтения (если надо — легко добавить Depends(get_current_user_id)).
# =============================================================================

from __future__ import annotations
from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from backend.repositories.hackathons import HackathonsRepo

router = APIRouter(prefix="/hackathons", tags=["hackathons"])
repo = HackathonsRepo()


# ---- Схемы ответа ----

class HackathonOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_link: Optional[str] = None

    start_date: str
    end_date: str
    registration_end_date: Optional[str] = None

    mode: str
    status: str
    city: Optional[str] = None
    team_members_minimum: Optional[int] = None
    team_members_limit: Optional[int] = None
    registration_link: Optional[str] = None
    prize_fund: Optional[str] = None

    created_at: str
    updated_at: str


# ---- Хелпер упаковки ----

def _pack(h) -> HackathonOut:
    """ORM → Pydantic."""
    return HackathonOut(
        id=h.id,
        name=h.name,
        description=h.description,
        image_link=h.image_link,
        start_date=str(h.start_date),
        end_date=str(h.end_date),
        registration_end_date=str(h.registration_end_date) if h.registration_end_date else None,
        mode=h.mode,
        status=h.status,
        city=h.city,
        team_members_minimum=h.team_members_minimum,
        team_members_limit=h.team_members_limit,
        registration_link=h.registration_link,
        prize_fund=h.prize_fund,
        created_at=str(h.created_at),
        updated_at=str(h.updated_at),
    )


# ---- Ручки ----

@router.get("", response_model=dict)
async def list_hackathons(
    q: Optional[str] = Query(default=None, description="Поиск по name/description (ILIKE)"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Список открытых хакатонов (status = 'open') с пагинацией.
    Параметры:
      • q — простой текстовый фильтр по name/description (опционально).
      • limit/offset — пагинация.
    Возвращает:
      • { items: HackathonOut[], limit, offset }.
    """
    items = await repo.list_open(q=q, limit=limit, offset=offset)
    return {
        "items": [_pack(h).model_dump() for h in items],
        "limit": limit,
        "offset": offset,
    }


@router.get("/{hackathon_id}", response_model=HackathonOut)
async def get_hackathon(hackathon_id: int):
    """
    Детальная карточка хакатона по id.
    404 — если не найден.
    """
    h = await repo.get_by_id(hackathon_id)
    if not h:
        raise HTTPException(status_code=404, detail="hackathon not found")
    return _pack(h)
