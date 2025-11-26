# admin_bot/services/api_client.py
from __future__ import annotations

import httpx
from httpx import HTTPStatusError

from admin_bot.config import settings


async def create_hackathon(payload: dict) -> dict:
    async with httpx.AsyncClient(base_url=settings.api_url, timeout=10.0) as client:
        resp = await client.post(
            "/hackathons",
            json=payload,
            headers={"X-Admin-Token": settings.api_token},
        )

        try:
            resp.raise_for_status()
        except HTTPStatusError as e:
            # попробуем вытащить detail
            try:
                err = resp.json()
            except ValueError:
                err = resp.text
            raise RuntimeError(f"API error {resp.status_code}: {err}") from e

        return resp.json()
