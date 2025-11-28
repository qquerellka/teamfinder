from __future__ import annotations

from typing import List

import boto3
from fastapi import UploadFile, HTTPException

from backend.settings.config import settings

_s3 = boto3.client(
    "s3",
    endpoint_url=settings.S3_ENDPOINT,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
)


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


def _validate_image(file: UploadFile) -> None:
    """
    Проверяем, что загружаемый файл:
      • имеет допустимый content-type,
      • не превышает лимит размера в МБ (грубая проверка через чтение в память).
    При нарушении — кидаем HTTPException(400).
    """
    allowed_types: List[str] = settings.S3_HACKATHON_ALLOWED_TYPES_LIST
    max_size_mb: int = settings.S3_HACKATHON_MAX_SIZE_MB

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "UNSUPPORTED_IMAGE_TYPE",
                "allowed_types": allowed_types,
            },
        )

    file_bytes = file.file.read()
    size_mb = len(file_bytes) / (1024 * 1024)

    if size_mb > max_size_mb:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "IMAGE_TOO_LARGE",
                "max_size_mb": max_size_mb,
                "actual_size_mb": round(size_mb, 2),
            },
        )

    file.file.seek(0)


def build_hackathon_key(hackathon_id: int, ext: str) -> str:
    """
    Формируем object key для картинки хакатона.
    Пример: hackathons/123/cover.png
    """
    return f"hackathons/{hackathon_id}/cover{ext}"


def make_public_url(key: str) -> str:
    """
    Строим публичный URL по базовому URL бакета и ключу.
    Пример:
      S3_PUBLIC_BASE_URL = "https://storage.yandexcloud.net/my-bucket"
      key = "hackathons/123/cover.png"
      → "https://storage.yandexcloud.net/my-bucket/hackathons/123/cover.png"
    """
    base = settings.S3_PUBLIC_BASE_URL.rstrip("/")
    return f"{base}/{key}"


def upload_hackathon_image_to_s3(hackathon_id: int, file: UploadFile) -> str:
    """
    Загрузить картинку хакатона в S3 и вернуть публичный URL.

    Шаги:
      1. Проверяем content-type и размер файла (_validate_image).
      2. Определяем расширение по content-type.
      3. Формируем object key (build_hackathon_key).
      4. Отправляем файл в бакет через upload_fileobj.
      5. Строим публичный URL (make_public_url) и возвращаем его.
    """
    _validate_image(file)

    ext = _guess_extension(file.content_type)

    key = build_hackathon_key(hackathon_id, ext)

    try:
        _s3.upload_fileobj(
            Fileobj=file.file,
            Bucket=settings.S3_BUCKET,
            Key=key,
            ExtraArgs={
                # Если бакет не целиком публичный, а права ставим по объектам:
                # этот ACL делает объект доступным для чтения всем.
                "ACL": "public-read",
                "ContentType": file.content_type,
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="IMAGE_UPLOAD_FAILED",
        )

    return make_public_url(key)


def upload_hackathon_image_from_bytes(
    hackathon_id: int,
    data: bytes,
    content_type: str | None,
) -> str:
    ext = _guess_extension(content_type)
    key = build_hackathon_key(hackathon_id, ext)

    try:
        _s3.put_object(
            Bucket=settings.S3_BUCKET,
            Key=key,
            Body=data,
            ACL="public-read",
            ContentType=content_type or "image/jpeg",
        )
    except Exception:
        logger.exception("S3 upload failed")
        raise HTTPException(status_code=500, detail="IMAGE_UPLOAD_FAILED")

    return make_public_url(key)
