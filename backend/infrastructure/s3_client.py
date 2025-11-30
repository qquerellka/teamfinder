from __future__ import annotations

from typing import List, Optional

import aioboto3
from fastapi import UploadFile, HTTPException

from backend.settings.config import settings

# --- Общая сессия aioboto3 ---

_session = aioboto3.Session()

def _guess_extension(content_type: str | None) -> str:
    """
    Пытаемся угадать расширение по content-type.
    Если ничего внятного нет — по умолчанию считаем .jpg.
    """
    if not content_type:
        return ".jpg"

    content_type = content_type.lower().strip()

    mapping = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }
    if content_type in mapping:
        return mapping[content_type]

    if content_type.startswith("image/"):
        subtype = content_type.split("/", 1)[1]
        if subtype in ("jpeg", "jpg"):
            return ".jpg"
        if subtype == "png":
            return ".png"
        if subtype == "webp":
            return ".webp"

    return ".jpg"


def _validate_image_bytes(data: bytes, content_type: str | None) -> None:
    """
    Проверяем тип и размер картинки по байтам и content-type.
    content_type может быть None (например, от Telegram) — тогда по типу не валидируем.
    """
    allowed_types: List[str] = settings.S3_HACKATHON_ALLOWED_TYPES_LIST
    max_size_mb: int = settings.S3_HACKATHON_MAX_SIZE_MB

    if content_type is not None and content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "UNSUPPORTED_IMAGE_TYPE",
                "allowed_types": allowed_types,
            },
        )

    size_mb = len(data) / (1024 * 1024)
    if size_mb > max_size_mb:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "IMAGE_TOO_LARGE",
                "max_size_mb": max_size_mb,
                "actual_size_mb": round(size_mb, 2),
            },
        )


def build_hackathon_key(hackathon_id: int, ext: str) -> str:
    return f"hackathons/{hackathon_id}/cover{ext}"


def make_public_url(key: str) -> str:
    base = settings.S3_PUBLIC_BASE_URL.rstrip("/")
    return f"{base}/{key}"

async def _put_object(
    *,
    key: str,
    data: bytes,
    content_type: str | None,
) -> None:
    """
    Внутренний helper: положить объект в S3 асинхронно.
    """
    try:
        async with _session.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
        ) as s3:
            await s3.put_object(
                Bucket=settings.S3_BUCKET,
                Key=key,
                Body=data,
                ACL="public-read",
                ContentType=content_type or "image/jpeg",
                # Можно добавить ContentDisposition="inline", если нужно,
                # но это уже вопрос настроек отдачи.
            )
    except Exception:
        raise HTTPException(status_code=500, detail="IMAGE_UPLOAD_FAILED")

async def upload_hackathon_image_to_s3(hackathon_id: int, file: UploadFile) -> str:
    """
    Загрузить картинку хакатона в S3 и вернуть публичный URL.
    Используется для обычного UploadFile (форма на сайте и т.п.).
    """
    data = await file.read()
    content_type: Optional[str] = getattr(file, "content_type", None)

    _validate_image_bytes(data, content_type)
    ext = _guess_extension(file.content_type)
    key = build_hackathon_key(hackathon_id, ext)

    await _put_object(key=key, data=data, content_type=content_type)
    return make_public_url(key)


async def upload_hackathon_image_from_bytes(
    hackathon_id: int,
    data: bytes,
    content_type: str | None,
) -> str:
    """
    Загрузить картинку хакатона в S3 из байтов (используется для Telegram file_id).
    """
    _validate_image_bytes(data, content_type)
    ext = _guess_extension(content_type)
    key = build_hackathon_key(hackathon_id, ext)

    await _put_object(key=key, data=data, content_type=content_type)
    return make_public_url(key)
