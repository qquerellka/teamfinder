# =============================================================================
# ФАЙЛ: backend/infrastructure/s3_client.py
# КРАТКО: Работа с S3-совместимым хранилищем (Yandex Object Storage).
# ЗАЧЕМ:
#   • Один общий boto3-клиент для Object Storage.
#   • Удобные хелперы для загрузки файлов (в т.ч. картинок хакатонов).
#   • Формирование ключей и публичных URL по единым правилам.
#
# КАК ЭТО ЧИТАТЬ:
#   S3 / Object Storage ≈ «папка в облаке», где лежат файлы (объекты).
#   bucket        — «корневая директория» (контейнер для файлов).
#   object key    — «путь к файлу» внутри бакета (типа "hackathons/1/cover.png").
#   публичный URL — адрес, по которому файл открывается из браузера.
# =============================================================================

from __future__ import annotations

from typing import List

import boto3
from fastapi import UploadFile, HTTPException

from backend.settings.config import settings


# --- Инициализация S3-клиента ---

# Создаём один общий S3-клиент на всё приложение.
# Для Yandex Object Storage важно указать endpoint_url, access_key и secret_key.
_s3 = boto3.client(
    "s3",
    endpoint_url=settings.S3_ENDPOINT,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
)


# --- Внутренние хелперы ---

def _guess_extension(content_type: str) -> str:
    """
    По content-type пытаемся подобрать расширение файла.
    Если тип неизвестен — возвращаем .bin (на твой вкус можно кидать ошибку).
    """
    mapping = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }
    return mapping.get(content_type, ".bin")


def _validate_image(file: UploadFile) -> None:
    """
    Проверяем, что загружаемый файл:
      • имеет допустимый content-type,
      • не превышает лимит размера в МБ (грубая проверка через чтение в память).
    При нарушении — кидаем HTTPException(400).
    """
    allowed_types: List[str] = settings.S3_HACKATHON_ALLOWED_TYPES_LIST
    max_size_mb: int = settings.S3_HACKATHON_MAX_SIZE_MB

    # Проверяем content-type
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "UNSUPPORTED_IMAGE_TYPE",
                "allowed_types": allowed_types,
            },
        )

    # Грубая проверка размера: читаем весь файл в память.
    # Для небольших картинок (аватар/обложка) это обычно ок.
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

    # Важно: после чтения нужно вернуть файловый указатель в начало,
    # иначе при upload_fileobj мы зальём «конец файла».
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


# --- Публичный хелпер для загрузки картинки хакатона ---

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
    # 1. Валидация
    _validate_image(file)

    # 2. Расширение по content-type
    ext = _guess_extension(file.content_type)

    # 3. Формируем ключ
    key = build_hackathon_key(hackathon_id, ext)

    # 4. Загрузка в Object Storage
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
        # В реальном приложении лучше залогировать e (logger.error(...))
        raise HTTPException(
            status_code=500,
            detail="IMAGE_UPLOAD_FAILED",
        )

    # 5. Возвращаем публичный URL
    return make_public_url(key)
