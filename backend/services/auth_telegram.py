from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict

from backend.repositories.users import UsersRepo
from backend.settings.config import settings
from backend.utils.telegram_initdata import InitDataError, verify_init_data

# Мягкий импорт JWT-утилиты: сначала пробуем основную, потом упрощённую.
try:
    from backend.utils.jwt import encode as jwt_encode
except Exception:
    from backend.utils import jwt_simple as _jwt_simple  # type: ignore

    jwt_encode = _jwt_simple.encode  # type: ignore[attr-defined]


@dataclass(frozen=True)
class AuthResult:
    user_id: int
    access_token: str


class AuthTelegramService:
    """
    Авторизация через Telegram Mini App:

    1) проверка init_data;
    2) upsert пользователя;
    3) выпуск JWT.
    """

    def __init__(self) -> None:
        self.users = UsersRepo()

        self.bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", None) or os.getenv(
            "TELEGRAM_BOT_TOKEN", ""
        )

        self.jwt_secret = (
            getattr(settings, "JWT_SECRET", None)
            or os.getenv("JWT_SECRET", "")
            or "dev-secret-change-me"
        )

        self.jwt_ttl = int(
            getattr(settings, "JWT_TTL_SECONDS", None)
            or os.getenv("JWT_TTL_SECONDS", 7 * 24 * 3600)
        )

    async def authenticate(self, init_data_raw: str) -> AuthResult:
        """
        Боевая авторизация по init_data из Telegram WebApp.
        Может выбросить InitDataError при невалидных данных.
        """
        parsed: Dict[str, Any] = verify_init_data(
            init_data_raw,
            self.bot_token,
            max_age_seconds=300,
        )
        tg_user = parsed["user"]

        user = await self.users.upsert_from_tg(tg_user)

        token = jwt_encode(
            {"sub": str(user.id)},
            self.jwt_secret,
            exp_seconds=self.jwt_ttl,
        )

        return AuthResult(user_id=user.id, access_token=token)

    async def authenticate_dev(self, tg_user: Dict[str, Any]) -> AuthResult:
        """
        Упрощённая авторизация для DEV:
        минует verify_init_data и сразу апсертит пользователя.
        """
        user = await self.users.upsert_from_tg(tg_user)

        token = jwt_encode(
            {"sub": str(user.id)},
            self.jwt_secret,
            exp_seconds=self.jwt_ttl,
        )

        return AuthResult(user_id=user.id, access_token=token)
