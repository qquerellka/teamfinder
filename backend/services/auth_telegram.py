# =============================================================================
# ФАЙЛ: backend/services/auth_telegram.py
# КРАТКО: сервис авторизации через Telegram Mini App.
# ЗАЧЕМ:
#   • Принимает init_data из Telegram WebApp, проверяет подпись/срок (verify_init_data).
#   • Создаёт/обновляет пользователя по данным Telegram (UsersRepo.upsert_from_tg).
#   • Генерирует access_token (JWT) и возвращает (user_id, access_token).
# КОМУ ПОЛЕЗНО:
#   • Роутеру /auth/telegram — чтобы получить устойчивый user_id и токен.
#   • Разработчикам — как единая точка логики авторизации.
# =============================================================================

from __future__ import annotations  # Отложенная оценка аннотаций (удобно для типизации и импорта)

from dataclasses import dataclass   # dataclass — быстрый способ описать «контейнер данных»
from typing import Any, Dict        # Аннотации типов для словарей
import os                           # Читаем fallback-переменные окружения

from backend.settings.config import settings  # Настройки приложения (токены, TTL)
from backend.repositories.users import UsersRepo  # Репозиторий пользователей (апсерт по данным из Telegram)
from backend.utils.telegram_initdata import verify_init_data, InitDataError  # Проверка подписи initData

# Мягкий импорт JWT-утилиты.
# Пытаемся взять «основную» utils/jwt.py (encode), если её нет — используем упрощённую utils/jwt_simple.py.
try:
    from backend.utils.jwt import encode as jwt_encode
except Exception:
    # Запасной вариант: упростим импорт и возьмём encode из jwt_simple
    from backend.utils import jwt_simple as _jwt_simple  # type: ignore
    jwt_encode = _jwt_simple.encode  # type: ignore[attr-defined]


@dataclass(frozen=True)
class AuthResult:
    """Результат аутентификации: минимальный набор данных, нужный роутеру/клиенту."""
    user_id: int
    access_token: str


class AuthTelegramService:
    """
    Сервис, который:
      1) валидирует init_data от Telegram;
      2) апсертит пользователя;
      3) выпускает JWT.
    """

    def __init__(self) -> None:
        # Репозиторий пользователей: сам откроет краткоживущую сессию «на операцию»
        self.users = UsersRepo()

        # Читаем секреты: сперва из settings, затем fallback в переменные окружения
        self.bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", os.getenv("TELEGRAM_BOT_TOKEN", ""))
        # Секрет для подписи JWT; безопаснее хранить в settings/env. Есть dev-дефолт на случай отсутствия.
        self.jwt_secret = getattr(settings, "JWT_SECRET", os.getenv("JWT_SECRET", "")) or "dev-secret-change-me"
        # Время жизни токена (в секундах). По умолчанию: 7 суток.
        self.jwt_ttl = int(getattr(settings, "JWT_TTL_SECONDS", os.getenv("JWT_TTL_SECONDS", 7 * 24 * 3600)))

    async def authenticate(self, init_data_raw: str) -> AuthResult:
        """
        Главный метод: принимает «сырую» строку init_data от Telegram WebApp.
        Шаги:
          1) verify_init_data(...) — проверяет подпись/свежесть (обычно 5 минут).
          2) users.upsert_from_tg(...) — создаёт/обновляет профиль пользователя.
          3) jwt_encode(...) — выдаёт access_token (payload: sub = user.id).
        Может выбросить InitDataError при невалидной подписи/просрочке — роутер маппит в 401.
        """
        # 1) Валидируем initData (подпись строится на основе bot_token; max_age_seconds — «свежесть» данных)
        parsed: Dict[str, Any] = verify_init_data(init_data_raw, self.bot_token, max_age_seconds=300)
        tg_user = parsed["user"]  # Словарь с полями пользователя из Telegram (id, username, first_name, ...)

        # 2) Апсертим пользователя по данным из Telegram
        user = await self.users.upsert_from_tg(tg_user)

        # 3) Генерируем короткоживущий access_token (обычно HS256 внутри utils.jwt/jwt_simple)
        # В sub кладём str(user.id), чтобы в дальнейшем восстанавливать пользователя по токену.
        token = jwt_encode({"sub": str(user.id)}, self.jwt_secret, exp_seconds=self.jwt_ttl)

        # Возвращаем минимальный, но достаточный набор данных
        return AuthResult(user_id=user.id, access_token=token)
