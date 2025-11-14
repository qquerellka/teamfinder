from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List


@dataclass
class Settings:
    bot_token: str
    api_url: str
    api_token: str
    admin_ids: List[int]


def _parse_admin_ids(raw: str | None) -> List[int]:
    if not raw:
        return []
    ids = []
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        try:
            ids.append(int(part))
        except ValueError:
            continue
    return ids


settings = Settings(
    bot_token=os.environ.get("ADMIN_BOT_TOKEN", ""),
    api_url=os.environ.get("API_URL", "http://api:8000"),
    api_token=os.environ.get("ADMIN_API_TOKEN", ""),
    admin_ids=_parse_admin_ids(os.environ.get("ADMIN_TELEGRAM_IDS")),
)

if not settings.bot_token:
    raise RuntimeError("ADMIN_BOT_TOKEN is not set")

if not settings.api_token:
    # Пока просто требуем токен, чтобы стучаться в API.
    raise RuntimeError("ADMIN_API_TOKEN is not set")
