from __future__ import annotations

import logging
import httpx
from fastapi import HTTPException

from settings.config import settings

logger = logging.getLogger(__name__)
TELEGRAM_API_BASE = "https://api.telegram.org"


async def _get_file_path(file_id: str) -> str:
    url = f"{TELEGRAM_API_BASE}/bot{settings.TELEGRAM_BOT_TOKEN}/getFile"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, params={"file_id": file_id})
    except httpx.RequestError as e:
        logger.exception(
            "Telegram getFile request error: file_id=%s url=%s err=%r", file_id, url, e
        )
        raise HTTPException(status_code=400, detail="TELEGRAM_GET_FILE_FAILED")

    # Логируем не-200 с телом (Telegram обычно возвращает JSON с description)
    if resp.status_code != 200:
        logger.error(
            "Telegram getFile HTTP %s: file_id=%s body=%s",
            resp.status_code,
            file_id,
            resp.text,
        )
        raise HTTPException(status_code=400, detail="TELEGRAM_GET_FILE_FAILED")

    try:
        data = resp.json()
    except ValueError:
        logger.error(
            "Telegram getFile invalid JSON: file_id=%s body=%s", file_id, resp.text
        )
        raise HTTPException(status_code=400, detail="TELEGRAM_GET_FILE_FAILED")

    if not data.get("ok"):
        logger.error("Telegram getFile not ok: file_id=%s resp=%s", file_id, data)
        # опционально: можно вернуть description наружу (для админского бота это обычно ок)
        raise HTTPException(
            status_code=400,
            detail={
                "code": "TELEGRAM_GET_FILE_FAILED",
                "telegram": data.get("description"),
            },
        )

    result = data.get("result") or {}
    file_path = result.get("file_path")
    if not file_path:
        logger.error("Telegram getFile no file_path: file_id=%s resp=%s", file_id, data)
        raise HTTPException(status_code=400, detail="TELEGRAM_GET_FILE_FAILED")

    return file_path


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
    file_path = await _get_file_path(file_id)

    file_url = f"{TELEGRAM_API_BASE}/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_path}"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(file_url)
        resp.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(status_code=400, detail="TELEGRAM_FILE_DOWNLOAD_FAILED")

    raw_ct = resp.headers.get("Content-Type")
    if not raw_ct or raw_ct == "application/octet-stream":
        content_type = _guess_content_type_from_path(file_path)
    else:
        content_type = raw_ct
    return resp.content, content_type
