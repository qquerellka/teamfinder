# =============================================================================
# ФАЙЛ: backend/presentations/routers/applications.py
# КРАТКО: роутер FastAPI для анкет пользователей на хакатоны (Application).
# ЗАЧЕМ:
# • Позволяет пользователям создавать и редактировать свою анкету на конкретный хакатон.
# • Даёт капитанам/другим пользователям список анкет с базовой фильтрацией.
# • Возвращает «карточку анкеты», собранную из нескольких источников:
# - application: id, hackathon_id, user_id, role
# - users: username, first_name, last_name
# - user_skill/skill: skills[]
# - hackathon: registration_end_date
# ОСОБЕННОСТИ:
# • Аутентификация через JWT (извлекаем user_id).
# • На 1 хакатон — у пользователя может быть только 1 анкета.
# • Фильтр списка — только по роли и по q (username/first_name/last_name).
# • skills в карточке подтягиваются из профиля (user_id), пока не храним их в application (MVP).
# • Ответы типизированы Pydantic-моделями (удобно для Swagger/Redoc).
# ПАГИНАЦИЯ:
# • Списки возвращают {"items": [...], "limit": X, "offset": Y}.
# ДОГОВОР С ФРОНТОМ (ApplicationCardOut):
# • id, hackathon_id, user_id, role, username, first_name, last_name, skills[], registration_end_date
# =============================================================================

from __future__ import annotations

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

# Реиспользуем готовую зависимость JWT -> user_id
from backend.presentations.routers.users import get_current_user_id

# Репозитории
from backend.repositories.users import UsersRepo
from backend.repositories.hackathons import HackathonsRepo
from backend.repositories.applications import ApplicationsRepo

# Enum-типы (как в persistend/enums.py)
from backend.persistend.enums import RoleType, ApplicationStatus

router = APIRouter(tags=["applications"])

users_repo = UsersRepo()
hacks_repo = HackathonsRepo()
apps_repo  = ApplicationsRepo()

# ---- СХЕМЫ ----

class SkillOut(BaseModel):
    id: int
    slug: str
    name: str

class ApplicationCardOut(BaseModel):
    """
    Карточка анкеты (собирается из нескольких таблиц).
    """
    id: int
    hackathon_id: int
    user_id: int
    role: Optional[RoleType] = None

    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    skills: List[SkillOut] = Field(default_factory=list)
    registration_end_date: Optional[str] = None  # ISO-строка

class ApplicationCreateIn(BaseModel):
    """Тело POST: создать анкету на хакатон."""
    role: Optional[RoleType] = None

class ApplicationPatchIn(BaseModel):
    """Тело PATCH: частично обновить мою анкету на хакатон."""
    role: Optional[RoleType] = None
    status: Optional[ApplicationStatus] = None  # published/hidden (draft добавишь — расширишь Enum)

# ---- ВСПОМОГАТЕЛЬНАЯ СБОРКА КАРТОЧКИ ----

async def _pack_application_card(app_obj) -> ApplicationCardOut:
    """
    Сборка карточки анкеты:
      • из application: id, hackathon_id, user_id, role
      • из users: username, first_name, last_name
      • из user_skill/skill: skills[]
      • из hackathon: registration_end_date
    """
    usr = await users_repo.get_by_id(app_obj.user_id)
    if not usr:
        raise HTTPException(status_code=500, detail="dangling application: user not found")

    u_skills = await users_repo.get_user_skills(usr.id)
    skills_out = [SkillOut(id=s.id, slug=s.slug, name=s.name) for s in u_skills]

    hack = await hacks_repo.get_by_id(app_obj.hackathon_id)
    reg_end = hack.registration_end_date.isoformat() if (hack and hack.registration_end_date) else None

    return ApplicationCardOut(
        id=app_obj.id,
        hackathon_id=app_obj.hackathon_id,
        user_id=app_obj.user_id,
        role=app_obj.role,
        username=usr.username,
        first_name=usr.first_name,
        last_name=usr.last_name,
        skills=skills_out,
        registration_end_date=reg_end,
    )

# ---- РОУТЫ ----

@router.get("/hackathons/{hackathon_id}/applications", response_model=dict)
async def list_hackathon_applications(
# Возвращает список карточек анкет одного хакатона с пагинацией и простыми фильтрами.  
    hackathon_id: int,
    role: Optional[RoleType] = Query(default=None, description="Фильтр по роли"),
    q: Optional[str] = Query(
        default=None,
        description="Поиск по username/first_name/last_name (ILIKE, без учёта регистра)"
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _me: int = Depends(get_current_user_id),
):
    """
    Вернуть массив карточек анкет одного хакатона c пагинацией.
      • role — Enum-фильтр по роли (опционально)
      • q    — поиск по username/first_name/last_name
    """
    rows = await apps_repo.search(
        hackathon_id=hackathon_id,
        role=role.value if role else None,  # repo ожидает str | None
        q=q,
        limit=limit,
        offset=offset,
    )
    items = [await _pack_application_card(r) for r in rows]
    return {"items": [i.model_dump() for i in items], "limit": limit, "offset": offset}

@router.get("/hackathons/{hackathon_id}/applications/me", response_model=ApplicationCardOut)
async def get_my_application_on_hackathon(hackathon_id: int, user_id: int = Depends(get_current_user_id)):
# Возвращает мою анкету на указанный хакатон (карточка).  
    app = await apps_repo.get_by_user_and_hackathon(user_id=user_id, hackathon_id=hackathon_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")
    return await _pack_application_card(app)

@router.get("/hackathons/{hackathon_id}/applications/{user_id}", response_model=ApplicationCardOut)
async def get_user_application_on_hackathon(hackathon_id: int, user_id: int, _me: int = Depends(get_current_user_id)):
# Возвращает анкету конкретного пользователя на указанном хакатоне (карточка).
    app = await apps_repo.get_by_user_and_hackathon(user_id=user_id, hackathon_id=hackathon_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")
    return await _pack_application_card(app)

@router.post("/hackathons/{hackathon_id}/applications", response_model=ApplicationCardOut, status_code=status.HTTP_201_CREATED)
async def create_my_application(hackathon_id: int, payload: ApplicationCreateIn, user_id: int = Depends(get_current_user_id)):
# Создаёт мою анкету на конкретный хакатон. На 1 хакатон — только 1 анкета.
    exists = await apps_repo.get_by_user_and_hackathon(user_id=user_id, hackathon_id=hackathon_id)
    if exists:
        raise HTTPException(status_code=409, detail="application already exists for this hackathon")

    app = await apps_repo.create(
        user_id=user_id,
        hackathon_id=hackathon_id,
        role=payload.role.value if payload.role else None,
        skills=None,  # навыки не сохраняем в application (MVP)
    )
    return await _pack_application_card(app)

@router.patch("/hackathons/{hackathon_id}/applications/me", response_model=ApplicationCardOut)
async def patch_my_application(hackathon_id: int, payload: ApplicationPatchIn, user_id: int = Depends(get_current_user_id)):
# Частично обновляет мою анкету на указанном хакатоне (роль/описание/город/статус).
    app = await apps_repo.get_by_user_and_hackathon(user_id=user_id, hackathon_id=hackathon_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    data = payload.model_dump(exclude_unset=True)
    if "role" in data and data["role"] is not None:
        data["role"] = data["role"].value
    if "status" in data and data["status"] is not None:
        data["status"] = data["status"].value

    updated = await apps_repo.update(app.id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="application not found (update)")

    return await _pack_application_card(updated)

@router.get("/me/applications", response_model=dict)
async def list_my_applications(
# Возвращает пагинированный список всех моих анкет по всем хакатонам, где я их создавал.
# Удобно, когда нужно быстро посмотреть свой «портфель» заявок на разные события.
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: int = Depends(get_current_user_id),
):
    rows = await apps_repo.search_by_user(user_id=user_id, limit=limit, offset=offset)
    items = [await _pack_application_card(r) for r in rows]
    return {"items": [i.model_dump() for i in items], "limit": limit, "offset": offset}

@router.get("/me/applications/{hackathon_id}", response_model=ApplicationCardOut)
async def get_my_application_on_specific_hackathon(hackathon_id: int, user_id: int = Depends(get_current_user_id)):
# Возвращает мою анкету на конкретный хакатон (то же, что /hackathons/{hackathon_id}/applications/me, но из «моего раздела»).
    app = await apps_repo.get_by_user_and_hackathon(user_id=user_id, hackathon_id=hackathon_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")
    return await _pack_application_card(app)


