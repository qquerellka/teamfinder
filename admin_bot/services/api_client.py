from __future__ import annotations

import httpx
from httpx import HTTPStatusError

from config import settings


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

async def delete_hackathon(hackathon_id: int) -> bool:
    async with httpx.AsyncClient(base_url=settings.api_url, timeout=10.0) as client:
        resp = await client.delete(
            f"/hackathons/{hackathon_id}",
            headers={"X-Admin-Token": settings.api_token},
        )

        if resp.status_code == 204:
            return True
        elif resp.status_code == 404:
            return False
        else:
            try:
                err = resp.json()
            except ValueError:
                err = resp.text
            raise RuntimeError(f"API error {resp.status_code}: {err}")