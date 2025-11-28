from __future__ import annotations


import requests
from fastapi import HTTPException

from backend.settings.config import settings

TELEGRAM_API_BASE = "https://api.telegram.org"


def _get_file_path(file_id: str) -> str:
    """
    Вызывает getFile у Telegram Bot API и возвращает file_path.
    Документация: https://core.telegram.org/bots/api#getfile
    """
    url = f"{TELEGRAM_API_BASE}/bot{settings.TELEGRAM_BOT_TOKEN}/getFile"
    try:
        resp = requests.get(url, params={"file_id": file_id}, timeout=10)
        resp.raise_for_status()
    except Exception:
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


def download_telegram_file(file_id: str) -> tuple[bytes, str | None]:
    """
    По Telegram file_id скачиваем файл и возвращаем (байты, content_type).
    """
    file_path = _get_file_path(file_id)

    file_url = f"{TELEGRAM_API_BASE}/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_path}"
    try:
        resp = requests.get(file_url, timeout=20)
        resp.raise_for_status()
    except Exception:
        raise HTTPException(status_code=400, detail="TELEGRAM_FILE_DOWNLOAD_FAILED")

    # 1) пытаемся взять из заголовков
    # 2) если там мусор/ничего — пробуем угадать по расширению в пути
    content_type = resp.headers.get("Content-Type") or _guess_content_type_from_path(
        file_path
    )
    return resp.content, content_type
