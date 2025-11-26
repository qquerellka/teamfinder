# =============================================================================
# ФАЙЛ: backend/presentations/routers/hackathons.py
# КРАТКО: Роутер FastAPI для хакатонов.
# ЗАЧЕМ:
#   • Позволяет фронту получать список открытых хакатонов и деталь по id.
#   • Позволяет (через JWT) создавать/обновлять/удалять хакатоны.
#   • Схемы (Pydantic) описаны прямо в роутере (как в users.py).
# ОСОБЕННОСТИ:
#   • JWT не обязателен для чтения (GET), но обязателен для мутаций (POST/PATCH/DELETE).
# =============================================================================

from __future__ import annotations

from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Query, HTTPException, Depends, status, UploadFile, File
from pydantic import BaseModel, Field

from backend.repositories.hackathons import HackathonsRepo
from backend.presentations.routers.users import get_current_user_id  # берём готовый депенденси

from backend.infrastructure.s3_client import upload_hackathon_image_to_s3  # импорт для S3
from backend.infrastructure.s3_client import upload_hackathon_image_from_bytes
from backend.infrastructure.telegram_files import download_telegram_file
from backend.infrastructure.admin_auth import require_admin_token

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


# ---- Входные схемы ----

class HackathonCreateIn(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None

    image_file_id: Optional[str] = None

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

def _parse_ddmmyyyy(value: str | None, field_name: str) -> datetime | None:
    """
    Парсит дату в формате 'dd.mm.yyyy' -> datetime.
    Если value = None — возвращаем None.
    Если формат неверный — кидаем 400 с понятным описанием.
    """
    if value is None:
        return None
    try:
        return datetime.strptime(value, "%d.%m.%Y")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"invalid date format for {field_name}, expected dd.mm.yyyy",
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


@router.post(
    "",
    response_model=HackathonOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_hackathon(
    payload: HackathonCreateIn,
    _admin = Depends(require_admin_token),
):
    """
    Создать новый хакатон.
    Даты ожидаем в формате dd.mm.yyyy.

    Дополнительно:
      • если передан image_file_id (Telegram file_id),
        то backend сам скачивает картинку из Telegram и кладёт её в S3,
        а в БД сохраняет итоговый image_link.
    """
    data = payload.model_dump()

    # забираем file_id отдельно, чтобы не пихать его в repo.create
    image_file_id = data.pop("image_file_id", None)

    # --- Парсим даты ---
    data["start_date"] = _parse_ddmmyyyy(data["start_date"], "start_date")
    data["end_date"] = _parse_ddmmyyyy(data["end_date"], "end_date")
    data["registration_end_date"] = _parse_ddmmyyyy(
        data.get("registration_end_date"),
        "registration_end_date",
    )

    # 1. Создаём хакатон без картинки (image_link будет NULL по умолчанию)
    h = await repo.create(**data)

    # 2. Если бот прислал file_id — качаем картинку и кладём в S3
    if image_file_id:
        file_bytes, content_type = download_telegram_file(image_file_id)
        image_url = upload_hackathon_image_from_bytes(
            hackathon_id=h.id,
            data=file_bytes,
            content_type=content_type,
        )
        h = await repo.update(h.id, image_link=image_url)

    return _pack(h)


@router.patch(
    "/{hackathon_id}",
    response_model=HackathonOut,
)
async def update_hackathon(
    hackathon_id: int,
    payload: HackathonUpdateIn,
    _admin = Depends(require_admin_token),
):
    """
    Частично обновить хакатон.
    Даты ожидаем в формате dd.mm.yyyy.
    """
    data = payload.model_dump(exclude_unset=True)

    for field_name in ("start_date", "end_date", "registration_end_date"):
        if field_name in data:
            data[field_name] = _parse_ddmmyyyy(
                data[field_name],
                field_name,
            )

    h = await repo.update(hackathon_id, **data)
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
    _admin = Depends(require_admin_token),
):
    """
    Загрузить/обновить картинку (обложку) хакатона.

    Принимает multipart/form-data с полем "file".
    Сохраняет файл в S3 и обновляет поле image_link у хакатона.
    """
    # 1. Проверяем, что хакатон существует
    h = await repo.get_by_id(hackathon_id)
    if not h:
        raise HTTPException(status_code=404, detail="hackathon not found")

    # TODO: здесь можно добавить проверку ролей (организатор/админ),
    # пока достаточно факта, что пользователь авторизован.

    # 2. Заливаем файл в S3 и получаем публичный URL
    try:
        image_url = upload_hackathon_image_to_s3(hackathon_id=hackathon_id, file=file)
    except Exception:
        # В реальном коде лучше логировать и кидать более точное сообщение/тип
        raise HTTPException(status_code=500, detail="IMAGE_UPLOAD_FAILED")

    # 3. Обновляем хакатон в БД (image_link = новый URL)
    h = await repo.update(hackathon_id, image_link=image_url)
    if not h:
        # Теоретически не должно случиться, но на всякий случай
        raise HTTPException(status_code=404, detail="hackathon not found")

    # 4. Возвращаем актуальное состояние хакатона
    return _pack(h)


@router.delete(
    "/{hackathon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_hackathon(
    hackathon_id: int,
    _admin = Depends(require_admin_token),
):
    """
    Удалить хакатон.
    204 — если успешно;
    404 — если не найден.
    """
    ok = await repo.delete(hackathon_id)
    if not ok:
        raise HTTPException(status_code=404, detail="hackathon not found")
    # FastAPI сам вернёт пустой ответ с 204
