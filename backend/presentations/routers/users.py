# Этот файл реализует аутентификацию и управление данными пользователей через Telegram.
# Включает маршруты для получения информации о текущем пользователе, обновления его данных и поиска пользователей.
# Также включает обработку JWT-токенов для безопасной аутентификации.

from __future__ import annotations
import os  # Для работы с переменными окружения
from typing import Optional  # Для аннотаций типов
from fastapi import APIRouter, Depends, HTTPException, Header, status, Query  # Импортируем необходимые классы и функции из FastAPI
from pydantic import BaseModel, Field  # Для создания моделей данных и валидации
from sqlalchemy.ext.asyncio import AsyncSession  # Для асинхронных операций с базой данных
from backend.infrastructure.db import get_session  # Для получения сессии с базой данных
from backend.utils import jwt_simple  # Для работы с JWT
from backend.repositories.users import UsersRepo  # Импорт репозитория для работы с пользователями

# Создаем экземпляр маршрутизатора FastAPI для работы с пользователями
router = APIRouter(prefix="/users", tags=["users"])  

# Функция для получения ID текущего пользователя из заголовка авторизации
async def get_current_user_id(authorization: str | None = Header(default=None)) -> int:
    # Проверяем, есть ли в заголовке токен и начинается ли он с "Bearer"
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing token")
    token = authorization.split(" ", 1)[1]  # Извлекаем токен из заголовка
    try:
        # Декодируем токен и извлекаем payload с помощью функции из jwt_simple
        payload = jwt_simple.decode(token, os.getenv("JWT_SECRET", "dev-secret-change-me"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")  # Если токен некорректен
    return int(payload["sub"])  # Возвращаем ID пользователя из поля "sub" в payload

# Модель данных для вывода навыков пользователя
class UserSkillOut(BaseModel):
    id: int
    slug: str
    name: str

# Модель данных для вывода информации о пользователе
class UserOut(BaseModel):
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
    skills: list[UserSkillOut] = []  # Список навыков
    created_at: str
    updated_at: str
    match_count: int | None = None  # Только для /users?mode=any (количество совпадений по навыкам)

# Модель данных для изменения профиля пользователя
class UserPatchIn(BaseModel):
    bio: Optional[str] = Field(default=None, max_length=2000)  # Максимальная длина bio
    city: Optional[str] = Field(default=None, max_length=128)
    university: Optional[str] = Field(default=None, max_length=256)
    link: Optional[str] = Field(default=None, max_length=1024)
    skills: Optional[list[str]] = None  # Список slugs для замены набора навыков

# Роутер для получения данных о текущем пользователе
@router.get("/me", response_model=UserOut)
async def get_me(user_id: int = Depends(get_current_user_id), session: AsyncSession = Depends(get_session)):
    repo = UsersRepo(session)  # Создаем репозиторий для работы с пользователями
    user = await repo.get_by_id(user_id)  # Получаем пользователя по ID
    if not user:
        raise HTTPException(status_code=404, detail="user not found")  # Если пользователь не найден
    skills = await repo.get_user_skills(user_id)  # Получаем навыки пользователя
    return UserOut(
        id=user.id, telegram_id=user.telegram_id,
        username=user.username, first_name=user.first_name, last_name=user.last_name,
        avatar_url=user.avatar_url, bio=user.bio, city=user.city, university=user.university, link=user.link,
        skills=[UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in skills],  # Преобразуем навыки в UserSkillOut
        created_at=str(user.created_at), updated_at=str(user.updated_at)
    )

# Роутер для получение пользователя по id
@router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(user_id: int, session: AsyncSession = Depends(get_session), _current_user: int = Depends(get_current_user_id)):
    repo = UsersRepo(session)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    skills = await repo.get_user_skills(user_id)
    return UserOut(
        id=user.id, telegram_id=user.telegram_id,
        username=user.username, first_name=user.first_name, last_name=user.last_name,
        avatar_url=user.avatar_url, bio=user.bio, city=user.city, university=user.university, link=user.link,
        skills=[UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in skills],
        created_at=str(user.created_at), updated_at=str(user.updated_at)
    )

# Роутер для обновления данных профиля текущего пользователя
@router.patch("/me", response_model=UserOut)
async def patch_me(
    payload: UserPatchIn,  # Данные для обновления
    user_id: int = Depends(get_current_user_id),  # Получаем ID текущего пользователя
    session: AsyncSession = Depends(get_session),  # Получаем сессию с базой данных
):
    repo = UsersRepo(session)  # Создаем репозиторий для работы с пользователями
    user = await repo.get_by_id(user_id)  # Получаем пользователя по ID
    if not user:
        raise HTTPException(status_code=404, detail="user not found")  # Если пользователь не найден

    # Обновляем профиль пользователя
    await repo.update_profile_fields(user, payload.model_dump())

    # Обновляем навыки (замена набора), если поле skills передано
    if payload.skills is not None:
        try:
            skills = await repo.replace_user_skills_by_slugs(user_id, payload.skills, max_count=10)
        except ValueError as e:
            msg = str(e)
            if msg.startswith("too_many_skills:"):
                raise HTTPException(status_code=422, detail=msg.replace("too_many_skills:", "too_many_skills: "))
            if msg.startswith("unknown_skills:"):
                # Отдаем список неизвестных навыков
                unknown = msg.split(":", 1)[1].split(",") if ":" in msg else []
                raise HTTPException(status_code=422, detail={"error": "unknown_skills", "unknown": unknown})
            raise
    else:
        skills = await repo.get_user_skills(user_id)

    # Возвращаем обновленные данные пользователя
    user = await repo.get_by_id(user_id)
    return UserOut(
        id=user.id, telegram_id=user.telegram_id,
        username=user.username, first_name=user.first_name, last_name=user.last_name,
        avatar_url=user.avatar_url, bio=user.bio, city=user.city, university=user.university, link=user.link,
        skills=[UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in skills],
        created_at=str(user.created_at), updated_at=str(user.updated_at)
    )

# Роутер для поиска пользователей
@router.get("", response_model=dict)
async def search_users(
    q: Optional[str] = Query(default=None),  # Текстовый поиск
    skills: Optional[str] = Query(default=None, description="CSV: react,typescript"),  # Список slugs для поиска
    mode: str = Query(default="all", pattern="^(all|any)$"),  # Режим поиска: all — все навыки, any — хотя бы один
    limit: int = Query(default=20, ge=1, le=100),  # Лимит на количество результатов
    offset: int = Query(default=0, ge=0),  # Смещение для пагинации
    _current: int = Depends(get_current_user_id),  # Валидируем токен текущего пользователя
    session: AsyncSession = Depends(get_session),  # Получаем сессию с базой данных
):
    repo = UsersRepo(session)  # Создаем репозиторий для работы с пользователями
    skill_list = [s.strip() for s in skills.split(",")] if skills else None  # Преобразуем список slugs в список
    try:
        rows, total = await repo.search_users(q, skill_list, mode, limit, offset)
    except ValueError as e:
        msg = str(e)
        if msg.startswith("unknown_skills:"):
            unknown = msg.split(":", 1)[1].split(",") if ":" in msg else []
            raise HTTPException(status_code=422, detail={"error": "unknown_skills", "unknown": unknown})
        raise

    items = []
    for usr, mc in rows:
        # Получаем навыки пользователя для каждого найденного пользователя
        skills = await repo.get_user_skills(usr.id)
        items.append(UserOut(
            id=usr.id, telegram_id=usr.telegram_id,
            username=usr.username, first_name=usr.first_name, last_name=usr.last_name,
            avatar_url=usr.avatar_url, bio=usr.bio, city=usr.city, university=usr.university, link=usr.link,
            skills=[UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in skills],
            created_at=str(usr.created_at), updated_at=str(usr.updated_at),
            match_count=mc  # Количество совпадений для пользователя
        ).model_dump())

    return {"items": items, "total": total, "limit": limit, "offset": offset}  # Возвращаем результаты поиска с пагинацией
