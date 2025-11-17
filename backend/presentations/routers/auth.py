# =============================================================================
# ФАЙЛ: backend/presentations/routers/auth.py
# =============================================================================

from __future__ import annotations
from typing import Optional, List  # <-- добавили
from pydantic import BaseModel, Field  # <-- добавили Field
from fastapi import APIRouter, HTTPException, status

from backend.services.auth_telegram import AuthTelegramService, AuthResult
from backend.utils.telegram_initdata import InitDataError
from backend.repositories.users import UsersRepo

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = AuthTelegramService()
users_repo = UsersRepo()

# ----- Схемы -----

class TelegramInitIn(BaseModel):
    init_data: str

class UserSkillOut(BaseModel):
    id: int
    slug: str
    name: str

class UserAchievementOut(BaseModel):
    """Мини-представление достижения в профиле."""
    id: int
    user_id: int
    hackathon_id: int
    role: Optional[str] = None
    place: Optional[str] = None

class UserOut(BaseModel):
    """Профиль, который вернём после авторизации."""
    id: int
    telegram_id: int
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    city: str | None = None
    university: str | None = None
    link: str | None = None
    skills: list[UserSkillOut] = Field(default_factory=list)
    achievements: list[UserAchievementOut] = Field(default_factory=list)  # <-- добавили

class AuthOut(BaseModel):
    access_token: str
    profile: UserOut

# ----- Маппинг достижений -----

def _map_achievements(achs) -> List[UserAchievementOut]:
    def _val(x):
        return getattr(x, "value", x) if x is not None else None

    items: List[UserAchievementOut] = []
    for a in achs:
        # колонка в БД может называться hack_id — отдадим как hackathon_id
        hackathon_id = getattr(a, "hackathon_id", None)
        if hackathon_id is None:
            hackathon_id = getattr(a, "hack_id", None)

        items.append(UserAchievementOut(
            id=a.id,
            user_id=a.user_id,
            hackathon_id=int(hackathon_id) if hackathon_id is not None else None,
            role=_val(a.role),
            place=_val(a.place),
        ))
    return items

# ----- Роут -----

@router.post("/telegram", response_model=AuthOut)
async def auth_telegram(payload: TelegramInitIn):
    try:
        res: AuthResult = await auth_service.authenticate(payload.init_data)
    except InitDataError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = await users_repo.get_by_id(res.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    skills = await users_repo.get_user_skills(res.user_id)
    achs = await users_repo.get_user_achievements(res.user_id)  # <-- получаем достижения

    return AuthOut(
        access_token=res.access_token,
        profile=UserOut(
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
            achievements=_map_achievements(achs),  # <-- кладём в ответ
        ),
    )
