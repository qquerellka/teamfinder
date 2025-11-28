from __future__ import annotations

from typing import Optional, List, Literal

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Header,
    Query,
    status,
    Path,
)
from pydantic import BaseModel, Field

from backend.settings.config import settings
from backend.repositories.users import UsersRepo
from backend.repositories.achievements import AchievementsRepo
from backend.utils import jwt_simple
from backend.persistend.models import achievement as m_ach

router = APIRouter(prefix="/users", tags=["users"])

users_repo = UsersRepo()
ach_repo = AchievementsRepo()


# ---- Auth helper ----


async def get_current_user_id(authorization: str | None = Header(default=None)) -> int:
    """
    Достаём user_id из Authorization: Bearer <JWT>.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="missing token",
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt_simple.decode(token, settings.JWT_SECRET)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid token",
        )

    return int(payload["sub"])


# ---- Schemas ----


class UserSkillOut(BaseModel):
    id: int
    slug: str
    name: str


class UserAchievementOut(BaseModel):
    id: int
    hackathon_id: Optional[int] = None
    role: Optional[str] = None
    place: Optional[str] = None


class UserOut(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    university: Optional[str] = None
    link: Optional[str] = None
    skills: List[UserSkillOut] = Field(default_factory=list)
    achievements: List[UserAchievementOut] = Field(default_factory=list)
    match_count: int | None = None


class UserPatchIn(BaseModel):
    bio: Optional[str] = Field(default=None, max_length=2000)
    city: Optional[str] = Field(default=None, max_length=128)
    university: Optional[str] = Field(default=None, max_length=256)
    link: Optional[str] = Field(default=None, max_length=1024)
    skills: Optional[List[str]] = None


class AchievementOut(BaseModel):
    id: int
    user_id: int
    hackathon_id: int
    role: m_ach.RoleType
    place: m_ach.AchievementPlace


class AchievementCreateIn(BaseModel):
    hackathon_id: int
    role: m_ach.RoleType
    place: Optional[m_ach.AchievementPlace] = None


# ---- Helpers ----


def _map_achievements(achs) -> List[UserAchievementOut]:
    def _val(x):
        return getattr(x, "value", x) if x is not None else None

    items: List[UserAchievementOut] = []
    for a in achs:
        hackathon_id = getattr(a, "hackathon_id", None)
        if hackathon_id is None:
            hackathon_id = getattr(a, "hack_id", None)

        items.append(
            UserAchievementOut(
                id=a.id,
                hackathon_id=int(hackathon_id) if hackathon_id is not None else None,
                role=_val(a.role),
                place=_val(a.place),
            )
        )
    return items


async def _pack_user(user_id: int) -> UserOut:
    user = await users_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    skills = await users_repo.get_user_skills(user_id)
    achievements = await users_repo.get_user_achievements(user_id)

    return UserOut(
        id=user.id,
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        city=user.city,
        university=user.university,
        link=user.link,
        skills=[UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in skills],
        achievements=_map_achievements(achievements),
    )


# ---- Routes ----


@router.get("/me", response_model=UserOut)
async def get_me(current_user_id: int = Depends(get_current_user_id)):
    return await _pack_user(current_user_id)


@router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(
    user_id: int,
    _current_user_id: int = Depends(get_current_user_id),
):
    return await _pack_user(user_id)


@router.patch("/me", response_model=UserOut)
async def patch_me(
    payload: UserPatchIn,
    current_user_id: int = Depends(get_current_user_id),
):
    user = await users_repo.update_profile(
        current_user_id,
        bio=payload.bio,
        city=payload.city,
        university=payload.university,
        link=payload.link,
    )
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    if payload.skills is not None:
        try:
            await users_repo.replace_user_skills_by_slugs(
                current_user_id,
                payload.skills,
                max_count=10,
            )
        except ValueError as e:
            msg = str(e)
            if msg.startswith("unknown_skills:"):
                unknown = [s for s in msg.split(":", 1)[1].split(",") if s]
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error": "unknown_skills", "unknown": unknown},
                )
            if msg.startswith("too_many_skills:"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error": "too_many_skills"},
                )
            raise HTTPException(status_code=400, detail=str(e))

    return await _pack_user(current_user_id)


@router.get("", response_model=dict)
async def search_users(
    q: Optional[str] = Query(
        default=None,
        description="Поиск по username/имени/фамилии",
    ),
    skills: Optional[str] = Query(
        default=None,
        description="CSV slug'ов навыков, например: react,typescript",
    ),
    mode: Literal["all", "any"] = Query(
        default="all",
        description="all — все навыки; any — хотя бы один",
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user_id: int = Depends(get_current_user_id),
):
    skill_list = [s.strip() for s in skills.split(",")] if skills else None

    try:
        rows, total = await users_repo.search_users(q, skill_list, mode, limit, offset)
    except ValueError as e:
        msg = str(e)
        if msg.startswith("unknown_skills:"):
            unknown = [s for s in msg.split(":", 1)[1].split(",") if s]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "unknown_skills", "unknown": unknown},
            )
        raise HTTPException(status_code=400, detail=str(e))

    items = []
    for usr, mc in rows:
        usr_skills = await users_repo.get_user_skills(usr.id)
        usr_achs = await users_repo.get_user_achievements(usr.id)

        items.append(
            UserOut(
                id=usr.id,
                telegram_id=usr.telegram_id,
                username=usr.username,
                first_name=usr.first_name,
                last_name=usr.last_name,
                avatar_url=usr.avatar_url,
                bio=usr.bio,
                city=usr.city,
                university=usr.university,
                link=usr.link,
                skills=[
                    UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in usr_skills
                ],
                achievements=_map_achievements(usr_achs),
                match_count=mc,
            ).model_dump()
        )

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/me/achievements", response_model=dict)
async def list_my_achievements(
    role: Optional[m_ach.RoleType] = Query(default=None),
    place: Optional[m_ach.AchievementPlace] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    items, total = await ach_repo.list_by_user(
        current_user_id,
        role=role,
        place=place,
        limit=limit,
        offset=offset,
    )
    return {
        "items": [
            AchievementOut(
                id=a.id,
                user_id=a.user_id,
                hackathon_id=a.hackathon_id,
                role=a.role,
                place=a.place,
            )
            for a in items
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{user_id}/achievements", response_model=dict)
async def list_user_achievements(
    user_id: int = Path(..., ge=1),
    role: Optional[m_ach.RoleType] = Query(default=None),
    place: Optional[m_ach.AchievementPlace] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user_id: int = Depends(get_current_user_id),
):
    items, total = await ach_repo.list_by_user(
        user_id,
        role=role,
        place=place,
        limit=limit,
        offset=offset,
    )
    return {
        "items": [
            AchievementOut(
                id=a.id,
                user_id=a.user_id,
                hackathon_id=a.hackathon_id,
                role=a.role,
                place=a.place,
            )
            for a in items
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post(
    "/me/achievements",
    response_model=AchievementOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_my_achievement(
    payload: AchievementCreateIn,
    current_user_id: int = Depends(get_current_user_id),
):
    try:
        ach = await ach_repo.create(
            user_id=current_user_id,
            hackathon_id=payload.hackathon_id,
            role=payload.role,
            place=payload.place or m_ach.AchievementPlace.participant,
        )
    except ValueError as e:
        msg = str(e)
        if msg == "duplicate_achievement":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "duplicate_achievement"},
            )
        if msg.startswith("integrity_error:"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "integrity_error"},
            )
        raise HTTPException(status_code=400, detail=msg)

    return AchievementOut(
        id=ach.id,
        user_id=ach.user_id,
        hackathon_id=ach.hackathon_id,
        role=ach.role,
        place=ach.place,
    )
