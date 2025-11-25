# =============================================================================
# ФАЙЛ: backend/infrastructure/telegram_files.py
# КРАТКО: Скачать файл из Telegram Bot API по file_id.
# ЗАЧЕМ:
#   • Бот присылает только file_id (image_file_id).
#   • Этот модуль умеет по file_id получить байты файла и content-type.
# =============================================================================

from __future__ import annotations

import mimetypes

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


def _guess_content_type_from_path(file_path: str) -> str:
    """
    По расширению file_path определяем content-type.
    Если не угадали — по умолчанию image/jpeg.
    """
    ctype, _ = mimetypes.guess_type(file_path)
    if ctype is None:
        return "image/jpeg"
    return ctype


def download_telegram_file(file_id: str) -> tuple[bytes, str]:
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

    content_type = resp.headers.get("Content-Type") or _guess_content_type_from_path(file_path)
    return resp.content, content_type
