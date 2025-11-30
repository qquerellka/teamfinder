from __future__ import annotations


import httpx
from fastapi import HTTPException

from backend.settings.config import settings

TELEGRAM_API_BASE = "https://api.telegram.org"


async def _get_file_path(file_id: str) -> str:
    """
    Асинхронно вызывает getFile у Telegram Bot API и возвращает file_path.
    Документация: https://core.telegram.org/bots/api#getfile
    """
    url = f"{TELEGRAM_API_BASE}/bot{settings.TELEGRAM_BOT_TOKEN}/getFile"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params={"file_id": file_id})
        resp.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(status_code=400, detail="TELEGRAM_GET_FILE_FAILED")

    data = resp.json()
    if not data.get("ok") or "result" not in data or "file_path" not in data["result"]:
        raise HTTPException(status_code=400, detail="TELEGRAM_GET_FILE_FAILED")

    return data["result"]["file_path"]


def _guess_content_type_from_path(path: str) -> str | None:
    lower = path.lower()
    if lower.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if lower.endswith(".png"):
        return "image/png"
    if lower.endswith(".webp"):
        return "image/webp"
    return None


async def download_telegram_file(file_id: str) -> tuple[bytes, str | None]:
    """
    Асинхронно скачиваем файл по Telegram file_id и возвращаем (байты, content_type).
    """
    file_path = await _get_file_path(file_id)

    file_url = f"{TELEGRAM_API_BASE}/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_path}"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(file_url)
        resp.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(status_code=400, detail="TELEGRAM_FILE_DOWNLOAD_FAILED")

    content_type = resp.headers.get("Content-Type") or _guess_content_type_from_path(
        file_path
    )
    return resp.content, content_type
