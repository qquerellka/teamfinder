# =============================================================================
# ФАЙЛ: backend/presentations/routers/auth.py
# КРАТКО: роутер FastAPI для аутентификации через Telegram WebApp.
# ЗАЧЕМ:
#   • Принимает init_data от Telegram Mini App.
#   • Через AuthTelegramService валидирует подпись/срок действия и получает AuthResult
#     (обычно: user_id + access_token/JWT).
#   • Достаёт профиль пользователя и его навыки из БД (UsersRepo открывает сессию сам).
#   • Возвращает клиенту access_token и полную структуру профиля (UserOut).
# КОМУ ПОЛЕЗНО:
#   • Начинающим: понять связку «роут -> сервис аутентификации -> репозиторий».
#   • Интеграции с фронтом: знать, какой JSON отправлять/получать.
# ПРИМЕЧАНИЯ:
#   • Исключения маппятся в корректные HTTP-коды (401 для InitDataError, 400 для прочих ошибок).
#   • created_at/updated_at приводятся к строке для простоты (можно вернуть ISO-даты как datetime).
# =============================================================================

from __future__ import annotations  # отложенная оценка типов — удобно для аннотаций и циклических импортов
from pydantic import BaseModel      # Pydantic-модели для валидации входа/выхода (схема ответа OpenAPI)
from fastapi import APIRouter, HTTPException, status  # роутер и исключения FastAPI

# Доменные сервисы/утилиты и репозитории нашего приложения:
from backend.services.auth_telegram import AuthTelegramService, AuthResult  # сервис аутентификации через Telegram initData
from backend.utils.telegram_initdata import InitDataError                   # ошибка в initData (подпись/срок и т.д.)
from backend.repositories.users import UsersRepo                            # репозиторий пользователей (сам открывает сессию на операцию)

# Создаём роутер с префиксом и группой тегов для Swagger/Redoc
router = APIRouter(prefix="/auth", tags=["auth"])

# Инициализируем зависимости на модульном уровне:
auth_service = AuthTelegramService()  # статeless-сервис — можно переиспользовать инстанс
users_repo = UsersRepo()              # репозиторий, внутри использует get_sessionmaker() и контекстные сессии

# ===== Pydantic-модели запроса/ответа (схемы для OpenAPI) =====

class TelegramInitIn(BaseModel):
    """Входная модель: строка init_data из Telegram Mini App (window.Telegram.WebApp.initData)."""
    init_data: str  # фронт присылает то, что получил от Telegram; сервер проверит подпись/валидность

class UserSkillOut(BaseModel):
    """Одна запись навыка пользователя для ответа API."""
    id: int
    slug: str
    name: str

class UserOut(BaseModel):
    """Публичный профиль пользователя, который вернём фронтенду после успешной авторизации."""
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
    skills: list[UserSkillOut]  # упрощённый список навыков
    created_at: str             # для простоты как str; можно заменить на datetime и настроить сериализацию ISO-8601
    updated_at: str

class AuthOut(BaseModel):
    """Ответ роутера авторизации: токен + профиль."""
    user_id: int
    access_token: str
    profile: UserOut

# ===== Роут =====

@router.post("/telegram", response_model=AuthOut)
async def auth_telegram(payload: TelegramInitIn):
    """
    Точка входа авторизации.
    1) Валидируем init_data через AuthTelegramService (подпись, свежесть).
    2) Получаем AuthResult с user_id и access_token (например, JWT).
    3) Читаем профиль пользователя и его навыки из БД.
    4) Возвращаем токен и профиль фронту.
    """
    try:
        # authenticate() проверит подпись Telegram, время, достанет/сгенерирует токен и вернёт user_id
        res: AuthResult = await auth_service.authenticate(payload.init_data)
    except InitDataError as e:
        # Ошибка в init_data (подпись, экспирация и т.п.) → 401 Unauthorized
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        # Любая другая ошибка на этом шаге → 400 Bad Request (можно логировать e для диагностики)
        raise HTTPException(status_code=400, detail=str(e))

    # Достаём пользователя из БД по id, который вернул сервис аутентификации
    user = await users_repo.get_by_id(res.user_id)
    if not user:
        # Если запись не найдена — либо неконсистентность, либо пользователь удалён → 404
        raise HTTPException(status_code=404, detail="user not found")

    # Подтягиваем навыки пользователя (репозиторий сам управляет сессией)
    skills = await users_repo.get_user_skills(res.user_id)

    # Собираем ответ по схеме AuthOut.
    # created_at/updated_at приводим к строке, чтобы избежать кастомной сериализации дат.
    return AuthOut(
        user_id=user.id,
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
            created_at=str(user.created_at),
            updated_at=str(user.updated_at),
        ),
    )
