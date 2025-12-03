# =============================================================================
# ФАЙЛ: backend/presentations/routers/applications.py
# КРАТКО: роутер FastAPI для анкет пользователей на хакатоны (Application).
# =============================================================================

from __future__ import annotations

from typing import Optional, List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
    Response,
)
from pydantic import BaseModel, Field

from backend.presentations.routers.users import get_current_user_id
from backend.repositories.users import UsersRepo
from backend.repositories.hackathons import HackathonsRepo
from backend.persistend.enums import RoleType, ApplicationStatus
from backend.services.applications import ApplicationsService

router = APIRouter(tags=["applications"])

users_repo = UsersRepo()
hacks_repo = HackathonsRepo()
apps_service = ApplicationsService()


# ---- СХЕМЫ ----


class SkillOut(BaseModel):
    id: int
    slug: str
    name: str


class ApplicationCardOut(BaseModel):
    id: int
    hackathon_id: int
    user_id: int
    role: Optional[RoleType] = None

    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    skills: List[SkillOut] = Field(default_factory=list)
    registration_end_date: Optional[str] = None


class ApplicationCreateIn(BaseModel):
    role: Optional[RoleType] = None


class ApplicationPatchIn(BaseModel):
    role: Optional[RoleType] = None
    # status: Optional[ApplicationStatus] = None


# ---- ВСПОМОГАТЕЛЬНАЯ СБОРКА КАРТОЧКИ ----


async def _pack_application_card(app_obj) -> ApplicationCardOut:
    usr = await users_repo.get_by_id(app_obj.user_id)
    if not usr:
        raise HTTPException(
            status_code=500, detail="dangling application: user not found"
        )

    u_skills = await users_repo.get_user_skills(usr.id)
    skills_out = [SkillOut(id=s.id, slug=s.slug, name=s.name) for s in u_skills]

    hack = await hacks_repo.get_by_id(app_obj.hackathon_id)
    reg_end = (
        hack.registration_end_date.isoformat()
        if (hack and hack.registration_end_date)
        else None
    )

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


# ---- РОУТЫ: список по хакатону ----


@router.get("/hackathons/{hackathon_id}/applications", response_model=dict)
async def list_hackathon_applications(
    hackathon_id: int,
    role: Optional[RoleType] = Query(
        default=None,
        description="Фильтр по роли (Enum RoleType)",
    ),
    q: Optional[str] = Query(
        default=None,
        description="Поиск по username/first_name/last_name (без учёта регистра)",
    ),
    limit: int = Query(default=20, ge=1, le=100, description="Размер страницы"),
    offset: int = Query(default=0, ge=0, description="Смещение от начала списка"),
    _me: int = Depends(get_current_user_id),
):
    rows = await apps_service.search(
        hackathon_id=hackathon_id,
        role=role.value if role else None,
        q=q,
        limit=limit,
        offset=offset,
    )

    items = [await _pack_application_card(r) for r in rows]

    return {
        "items": [i.model_dump() for i in items],
        "limit": limit,
        "offset": offset,
    }


# ---- РОУТЫ: моя анкета на хакатон ----


@router.get(
    "/hackathons/{hackathon_id}/applications/me", response_model=ApplicationCardOut
)
async def get_my_application_on_hackathon(
    hackathon_id: int,
    user_id: int = Depends(get_current_user_id),
):
    app = await apps_service.get_my_for_hackathon(
        user_id=user_id,
        hackathon_id=hackathon_id,
    )
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    return await _pack_application_card(app)


@router.post(
    "/hackathons/{hackathon_id}/applications",
    response_model=ApplicationCardOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_my_application(
    hackathon_id: int,
    payload: ApplicationCreateIn,
    user_id: int = Depends(get_current_user_id),
):
    try:
        app = await apps_service.create(
            user_id=user_id,
            hackathon_id=hackathon_id,
            role=payload.role.value if payload.role else None,
            skills=None,
        )
    except ValueError as e:
        if str(e) == "app_exists":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="application already exists for this hackathon",
            )
        raise HTTPException(status_code=400, detail=str(e))

    return await _pack_application_card(app)


# ---- РОУТЫ: мои анкеты по всем хакатонам ----


@router.get("/me/applications", response_model=list[ApplicationCardOut])
async def list_my_applications(
    user_id: int = Depends(get_current_user_id),
):
    rows = await apps_service.list_my(user_id=user_id)
    items = [await _pack_application_card(r) for r in rows]
    return items


# ---- РОУТЫ: работа по application_id ----


@router.get("/applications/{application_id}", response_model=ApplicationCardOut)
async def get_application_by_id(
    application_id: int,
    _me: int = Depends(get_current_user_id),
):
    app = await apps_service.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    return await _pack_application_card(app)


@router.patch("/applications/{application_id}", response_model=ApplicationCardOut)
async def patch_application_by_id(
    application_id: int,
    payload: ApplicationPatchIn,
    user_id: int = Depends(get_current_user_id),
):
    app = await apps_service.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    if app.user_id != user_id:
        raise HTTPException(status_code=403, detail="forbidden: not an owner")

    data = payload.model_dump(exclude_unset=True)

    if "role" in data and data["role"] is not None:
        data["role"] = data["role"].value
    # if "status" in data and data["status"] is not None:
    #     data["status"] = data["status"].value

    updated = await apps_service.update(application_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="application not found (update)")

    return await _pack_application_card(updated)


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application_by_id(
    application_id: int,
    user_id: int = Depends(get_current_user_id),
):
    app = await apps_service.get(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    if app.user_id != user_id:
        raise HTTPException(status_code=403, detail="forbidden: not an owner")

    ok = await apps_service.delete(application_id)
    if not ok:
        raise HTTPException(status_code=404, detail="application not found (delete)")

    return Response(status_code=status.HTTP_204_NO_CONTENT)
