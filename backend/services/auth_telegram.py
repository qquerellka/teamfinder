from __future__ import annotations
import os
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from backend.utils.telegram_initdata import verify_init_data, InitDataError
from backend.utils import jwt_simple
from backend.repositories.users import UsersRepo

@dataclass(frozen=True)
class AuthResult:
    user_id: int
    access_token: str

class AuthTelegramService:
    def __init__(self, s: AsyncSession):
        self.s = s
        self.repo = UsersRepo(s)
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.jwt_secret = os.getenv("JWT_SECRET", "dev-secret-change-me")

    async def authenticate(self, init_data_raw: str) -> AuthResult:
        parsed = verify_init_data(init_data_raw, self.bot_token, max_age_seconds=300)
        tg_user = parsed["user"]
        user = await self.repo.upsert_from_tg(tg_user)
        token = jwt_simple.encode({"sub": user.id, "tg": user.telegram_id}, self.jwt_secret, exp_seconds=7*24*3600)
        return AuthResult(user_id=user.id, access_token=token)
