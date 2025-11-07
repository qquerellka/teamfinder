# Этот файл реализует аутентификацию пользователя через Telegram и возвращает информацию о пользователе, включая его навыки и токен доступа.
# Включает маршрут для аутентификации пользователя и получения его данных (профиль, навыки) после успешной авторизации через Telegram.

from __future__ import annotations
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status  # Импортируем нужные компоненты для FastAPI
from sqlalchemy.ext.asyncio import AsyncSession  # Для работы с асинхронной сессией SQLAlchemy
from backend.infrastructure.db import get_session  # Для получения сессии с базой данных
from backend.services.auth_telegram import AuthTelegramService  # Сервис для аутентификации через Telegram
from backend.utils.telegram_initdata import InitDataError  # Ошибки для некорректных данных Telegram
from backend.repositories.users import UsersRepo  # Репозиторий для работы с пользователями

# Создание экземпляра маршрутизатора FastAPI для аутентификации
router = APIRouter(prefix="/auth", tags=["auth"])

# Модель для входных данных аутентификации через Telegram
class TelegramInitIn(BaseModel):
    init_data: str  # Данные для инициализации, полученные из Telegram

# Модель для вывода информации о навыках пользователя
class UserSkillOut(BaseModel):
    id: int
    slug: str
    name: str

# Модель для вывода информации о пользователе
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
    skills: list[UserSkillOut]  # Список навыков пользователя
    created_at: str
    updated_at: str

# Модель для вывода информации об аутентификации (токен и профиль)
class AuthOut(BaseModel):
    user_id: int
    access_token: str
    profile: UserOut  # Включает профиль пользователя

# Роут для аутентификации через Telegram
@router.post("/telegram", response_model=AuthOut)
async def auth_telegram(payload: TelegramInitIn, session: AsyncSession = Depends(get_session)):
    service = AuthTelegramService(session)  # Инициализируем сервис для аутентификации через Telegram
    try:
        res = await service.authenticate(payload.init_data)  # Попытка аутентификации с использованием init_data
    except InitDataError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))  # Ошибка, если данные некорректны

    repo = UsersRepo(session)  # Создаем репозиторий для работы с пользователями
    user = await repo.get_by_id(res.user_id)  # Получаем пользователя по его ID
    skills = await repo.get_user_skills(res.user_id)  # Получаем навыки пользователя по его ID

    # Возвращаем данные пользователя, токен и навыки
    return AuthOut(
        user_id=user.id,
        access_token=res.access_token,  # Токен доступа
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
            skills=[UserSkillOut(id=s.id, slug=s.slug, name=s.name) for s in skills],  # Преобразуем навыки в UserSkillOut
            created_at=str(user.created_at),
            updated_at=str(user.updated_at),
        ),
    )
