from __future__ import annotations

from typing import Optional, List

from datetime import datetime
from fastapi import (
    APIRouter,
    Query,
    HTTPException,
    Depends,
    status,
    UploadFile,
    File,
)

from pydantic import BaseModel, Field

from backend.services.hackathons import HackathonsService, HackathonListResult
from backend.infrastructure.admin_auth import require_admin_token

router = APIRouter(prefix="/hackathons", tags=["hackathons"])
service = HackathonsService()


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


# ---- Входные схемы ----


class HackathonCreateIn(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None

    # Telegram file_id для картинки хакатона
    image_file_id: Optional[str] = None

    # всё как строки dd.mm.yyyy; парсит сервис
    start_date: str
    end_date: str
    registration_end_date: Optional[str] = None

    mode: str
    status: str = "open"
    city: Optional[str] = None
    team_members_minimum: Optional[int] = None
    team_members_limit: Optional[int] = None
    registration_link: Optional[str] = None
    prize_fund: Optional[str] = None


class HackathonUpdateIn(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    image_link: Optional[str] = None

    start_date: Optional[str] = None
    end_date: Optional[str] = None
    registration_end_date: Optional[str] = None

    mode: Optional[str] = None
    status: Optional[str] = None
    city: Optional[str] = None
    team_members_minimum: Optional[int] = None
    team_members_limit: Optional[int] = None
    registration_link: Optional[str] = None
    prize_fund: Optional[str] = None


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
        registration_end_date=(
            str(h.registration_end_date) if h.registration_end_date else None
        ),
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
    q: Optional[str] = Query(
        default=None, description="Поиск по name/description (ILIKE)"
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Список открытых хакатонов (status = 'open') с пагинацией.
    """
    result = await service.list_open(q=q, limit=limit, offset=offset)
    return {
        "items": [_pack(h).model_dump() for h in result.items],
        "limit": result.limit,
        "offset": result.offset,
    }


@router.get("/{hackathon_id}", response_model=HackathonOut)
async def get_hackathon(hackathon_id: int):
    """
    Детальная карточка хакатона по id.
    """
    h = await service.get_by_id(hackathon_id)
    if not h:
        raise HTTPException(status_code=404, detail="hackathon not found")
    return _pack(h)


@router.post(
    "",
    response_model=HackathonOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_hackathon(
    payload: HackathonCreateIn,
    _admin=Depends(require_admin_token),
):
    """
    Создать новый хакатон.
    Даты ожидаем в формате dd.mm.yyyy.
    Если передан image_file_id — забираем картинку из Telegram и кладём в S3.
    """
    try:
        h = await service.create_from_payload(payload.model_dump())
    except ValueError as e:
        msg = str(e)
        if msg.startswith("invalid_date_format:"):
            field = msg.split(":", 1)[1]
            raise HTTPException(
                status_code=400,
                detail=f"invalid date format for {field}, expected dd.mm.yyyy",
            )
        raise HTTPException(status_code=400, detail=msg)

    return _pack(h)


@router.patch(
    "/{hackathon_id}",
    response_model=HackathonOut,
)
async def update_hackathon(
    hackathon_id: int,
    payload: HackathonUpdateIn,
    _admin=Depends(require_admin_token),
):
    """
    Частично обновить хакатон.
    Даты ожидаем в формате dd.mm.yyyy.
    """
    data = payload.model_dump(exclude_unset=True)

    try:
        h = await service.update_from_payload(hackathon_id, data)
    except ValueError as e:
        msg = str(e)
        if msg.startswith("invalid_date_format:"):
            field = msg.split(":", 1)[1]
            raise HTTPException(
                status_code=400,
                detail=f"invalid date format for {field}, expected dd.mm.yyyy",
            )
        raise HTTPException(status_code=400, detail=msg)

    if not h:
        raise HTTPException(status_code=404, detail="hackathon not found")

    return _pack(h)


@router.post(
    "/{hackathon_id}/image",
    response_model=HackathonOut,
    status_code=status.HTTP_200_OK,
)
async def upload_hackathon_image(
    hackathon_id: int,
    file: UploadFile = File(...),
    _admin=Depends(require_admin_token),
):
    """
    Загрузить/обновить картинку (обложку) хакатона.
    """
    h = await service.upload_image_from_uploadfile(hackathon_id=hackathon_id, file=file)
    if not h:
        raise HTTPException(status_code=404, detail="hackathon not found")
    return _pack(h)


@router.delete(
    "/{hackathon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_hackathon(
    hackathon_id: int,
    _admin=Depends(require_admin_token),
):
    """
    Удалить хакатон.
    """
    ok = await service.delete(hackathon_id)
    if not ok:
        raise HTTPException(status_code=404, detail="hackathon not found")
    # 204 — без тела
