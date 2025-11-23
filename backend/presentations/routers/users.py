# =============================================================================
# ФАЙЛ: backend/presentations/routers/users.py
# КРАТКО: роутер FastAPI для работы с пользователями.
# ЗАЧЕМ:
#   • Авторизация по JWT (достаём user_id из заголовка Authorization).
#   • Получение собственного профиля / чужого профиля по id.
#   • Частичное обновление профиля (PATCH /users/me), включая замену набора навыков.
#   • Поиск пользователей с фильтрацией по тексту и навыкам.
# ОСОБЕННОСТИ:
#   • Репозиторий UsersRepo сам открывает асинхронные сессии «на операцию» (per-operation).
#   • В ответе отдаем Pydantic-модели (удобно для OpenAPI/доков).
#   • Ошибки репозитория маппим в понятные HTTP-коды и JSON-детали.
# ВАЖНЫЕ МИКРО-ПРАВКИ:
#   • skills в UserOut теперь через Field(default_factory=list), чтобы избежать «мутабельного дефолта».
#   • Параметр mode типизирован как Literal["all","any"] (строже, чем regex в Query).
#   • Удалены случайные посторонние комментарии из исходника.
# =============================================================================

from __future__ import annotations  # Современные аннотации типов (отложенная оценка)

import os                                 # Достаём секрет для JWT из переменных окружения
from typing import Optional, List, Literal # Типы для аннотаций (Optional, списки, Literal для ограниченных значений)

from fastapi import (                      # Компоненты FastAPI
    APIRouter, Depends, HTTPException, Header, Query, status, Path
)
from pydantic import BaseModel, Field      # Pydantic-модели схем, Field для настроек полей

from backend.repositories.users import UsersRepo  # Наш слой доступа к данным пользователей
from backend.utils import jwt_simple              # Простой модуль для кодирования/декодирования JWT
from backend.repositories.achievements import AchievementsRepo
from backend.persistend.models import achievement as m_ach

# Роутер с префиксом и тегом — красиво группируется в Swagger/Redoc
router = APIRouter(prefix="/users", tags=["users"])

# Репозиторий пользователей. Внутри он получает sessionmaker и открывает сессию на каждую операцию.
users_repo = UsersRepo()
ach_repo = AchievementsRepo()

# ---- Аутентификация (JWT -> user_id) ----

async def get_current_user_id(authorization: str | None = Header(default=None)) -> int:
    """
    Достаём user_id из заголовка Authorization: Bearer <JWT>.
    Если заголовка нет или токен невалиден — бросаем 401.
    """
    # Проверяем, что заголовок есть и начинается с 'Bearer '
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing token")

    # Забираем сам токен после пробела
    token = authorization.split(" ", 1)[1]

    try:
        # Декодируем токен и получаем payload (ожидаем, что в sub лежит user_id)
        payload = jwt_simple.decode(token, os.getenv("JWT_SECRET", "dev-secret-change-me"))
    except Exception:
        # Любая ошибка декодирования токена — это 401
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")

    # Возвращаем числовой идентификатор пользователя
    return int(payload["sub"])

# ---- Схемы (Pydantic) ----

class UserSkillOut(BaseModel):
    """Мини-представление навыка, используемое в ответах API."""
    id: int
    slug: str
    name: str
    
class UserAchievementOut(BaseModel):
    """Мини-представление достижения, используемое в ответах API."""
    id: int
    user_id: int
    hackathon_id: Optional[int] = None      # <<< было: int
    role: Optional[str] = None
    place: Optional[str] = None

class UserOut(BaseModel):
    """
    Публичный профиль пользователя.
    Поля опциональны, потому что в Телеграме часть из них может отсутствовать.
    """
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
    # ВАЖНО: default_factory=list вместо [] — избегаем общего мутабельного дефолта на уровне класса.
    skills: List[UserSkillOut] = Field(default_factory=list)
    achievements: List[UserAchievementOut] = Field(default_factory=list)
    # Даты удобнее отдавать в ISO-строке; можно сделать datetime и настроить сериализацию
    # created_at: str
    # updated_at: str
    # match_count выдаём только при поиске (mode="any"), иначе None
    match_count: int | None = None

class UserPatchIn(BaseModel):
    """
    Поля, которые можно частично обновить у текущего пользователя.
    Если поле не передано — оно не изменяется.
    """
    bio: Optional[str] = Field(default=None, max_length=2000)
    city: Optional[str] = Field(default=None, max_length=128)
    university: Optional[str] = Field(default=None, max_length=256)
    link: Optional[str] = Field(default=None, max_length=1024)
    # Полная замена набора навыков по slug (ограничиваем максимумом)
    skills: Optional[List[str]] = None
    achievements: Optional[List[str]] = None


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
    

# ---- Вспомогательное упаковывание пользователя ----

async def _pack_user(user_id: int) -> UserOut:
    """
    Достаём пользователя и его навыки и собираем объект UserOut.
    Общий хелпер, чтобы не дублировать код в хэндлерах.
    """
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

        # created_at=str(user.created_at),
        # updated_at=str(user.updated_at),
    )
def _map_achievements(achs) -> List[UserAchievementOut]:
    def _val(x):
        # поддержим и Enum, и str (на всякий случай)
        return getattr(x, "value", x) if x is not None else None

    items: List[UserAchievementOut] = []
    for a in achs:
        # в БД колонка может называться hack_id — отдадим как hackathon_id
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

# ---- Роуты ----

@router.get("/me", response_model=UserOut)
async def get_me(current_user_id: int = Depends(get_current_user_id)):
    """
    Получить свой профиль (по user_id из JWT).
    """
    return await _pack_user(current_user_id)

@router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(user_id: int, _current_user_id: int = Depends(get_current_user_id)):
    """
    Получить профиль любого пользователя по его id.
    Требует валидный JWT (но не обязательно, чтобы это был «сам пользователь»).
    """
    return await _pack_user(user_id)

@router.patch("/me", response_model=UserOut)
async def patch_me(payload: UserPatchIn, current_user_id: int = Depends(get_current_user_id)):
    """
    Частичное обновление своего профиля.
    Если payload.skills передан — заменяем весь набор навыков по списку slug (<= max_count).
    """
    # 1) Обновляем «простые» поля профиля
    user = await users_repo.update_profile(
        current_user_id,
        bio=payload.bio,
        city=payload.city,
        university=payload.university,
        link=payload.link,
    )
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    # 2) Если пришёл список skills — пробуем заменить весь набор
    if payload.skills is not None:
        try:
            await users_repo.replace_user_skills_by_slugs(
                current_user_id,
                payload.skills,
                max_count=10,  # ограничение по ТЗ (до 10 навыков)
            )
        except ValueError as e:
            # Репозиторий кодирует ошибки в текст, распаковываем в структурированный ответ
            msg = str(e)
            if msg.startswith("unknown_skills:"):
                # Собираем список неизвестных скиллов: "unknown_skills:python,elixir"
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
            # Любая другая ошибка — 400
            raise HTTPException(status_code=400, detail=str(e))

    # Возвращаем актуальные данные профиля
    return await _pack_user(current_user_id)

@router.get("", response_model=dict)
async def search_users(
    q: Optional[str] = Query(default=None, description="Поиск по тексту (username/имя/фамилия/био и т.д.)"),
    skills: Optional[str] = Query(default=None, description="CSV навыков по slug, например: react,typescript"),
    # Literal даёт строгую типизацию и валидирует значение ещё до вызова функции
    mode: Literal["all", "any"] = Query(default="all", description="all — все навыки; any — хотя бы один"),
    limit: int = Query(default=20, ge=1, le=100, description="Сколько записей вернуть"),
    offset: int = Query(default=0, ge=0, description="Сколько записей пропустить"),
    _current_user_id: int = Depends(get_current_user_id),
):
    """
    Поиск пользователей:
      • q — текстовый поиск.
      • skills — CSV со slug'ами навыков.
      • mode:
          - "all": у пользователя должны быть все указанные навыки,
          - "any": достаточно хотя бы одного (match_count покажет, сколько совпало).
    """
    # Преобразуем CSV "react, typescript" -> ["react", "typescript"]
    skill_list = [s.strip() for s in skills.split(",")] if skills else None

    try:
        # Репозиторий должен вернуть:
        #   rows  — список кортежей (пользователь, match_count)
        #   total — сколько всего результатов без учёта limit/offset
        rows, total = await users_repo.search_users(q, skill_list, mode, limit, offset)
    except ValueError as e:
        # Если репозиторий бросил "unknown_skills:..."
        msg = str(e)
        if msg.startswith("unknown_skills:"):
            unknown = [s for s in msg.split(":", 1)[1].split(",") if s]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "unknown_skills", "unknown": unknown},
            )
        # Иные ошибки поиска → 400
        raise HTTPException(status_code=400, detail=str(e))

    # Формируем список элементов для ответа.
    # ПРИМЕЧАНИЕ: тут есть N+1 — на каждого пользователя делаем отдельный запрос за skills.
    # Если это станет узким местом, оптимизируйте в репозитории «пакетную» выдачу скиллов по списку user_id.
    items = []
    for usr, mc in rows:
        usr_skills = await users_repo.get_user_skills(usr.id)
        usr_achs = await users_repo.get_user_achievements(usr.id)   # <<< добавили

        items.append(UserOut(
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
            skills=[UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in usr_skills],
            achievements=_map_achievements(usr_achs),                # <<< теперь переменная есть

            # created_at=str(usr.created_at),
            # updated_at=str(usr.updated_at),
            match_count=mc,
        ).model_dump())

    # Оборачиваем в пагинационный ответ
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.get("/me/achievements", response_model=dict)
async def list_my_achievements(
    role: Optional[m_ach.RoleType] = Query(default=None),
    place: Optional[m_ach.AchievementPlace] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Список моих достижений
    """
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
    """
    Список достижений произвольного пользователя.
    Требует валидный JWT, но user_id может быть любым.
    """
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

@router.post("/me/achievements", response_model=AchievementOut, status_code=status.HTTP_201_CREATED)
async def create_my_achievement(
    payload: AchievementCreateIn,
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Создать достижение текущему пользователю.
    Логика полностью как в старом POST /achievements.
    """
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
