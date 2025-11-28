from __future__ import annotations
from fastapi import Header, HTTPException, status
from backend.settings.config import settings


class AdminPrincipal:
    """Просто маркер того, что это запрос от админ-бота."""

    role: str = "admin-bot"


def require_admin_token(
    x_admin_token: str | None = Header(default=None, alias="X-Admin-Token")
) -> AdminPrincipal:
    """
    Проверяем заголовок X-Admin-Token.
    Если токен не задан или не совпадает с settings.ADMIN_API_TOKEN — кидаем 401.
    """
    if not settings.ADMIN_API_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_API_TOKEN is not configured",
        )

    if not x_admin_token or x_admin_token != settings.ADMIN_API_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid admin token",
        )

    return AdminPrincipal()
