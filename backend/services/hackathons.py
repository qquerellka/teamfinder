# backend/services/hackathons.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional, List

from fastapi import UploadFile

from backend.repositories.hackathons import HackathonsRepo
from backend.persistend.models import hackathon as m_hack
from backend.infrastructure.telegram_files import download_telegram_file
from backend.infrastructure.s3_client import (
    upload_hackathon_image_to_s3,
    upload_hackathon_image_from_bytes,
)


@dataclass(frozen=True)
class HackathonListResult:
    items: List[m_hack.Hackathon]
    limit: int
    offset: int


class HackathonsService:
    """
    Сервисный слой для работы с хакатонами.

    Отвечает за:
      • парсинг дат (dd.mm.yyyy → datetime);
      • создание/обновление хакатона через репозиторий;
      • загрузку/обновление обложки через Telegram file_id и S3;
      • простые инварианты и валидации.

    Репозиторий остаётся только про SQLAlchemy и БД.
    """

    def __init__(self) -> None:
        self.repo = HackathonsRepo()

    # --------- ВСПОМОГАТЕЛЬНОЕ ---------

    @staticmethod
    def _parse_ddmmyyyy(value: str | None, field_name: str) -> Optional[datetime]:
        """
        Парсит дату в формате 'dd.mm.yyyy' → datetime.
        Ошибки отдаём как ValueError с кодом, чтобы роутер мог их
        замапить в 400 Bad Request.
        """
        if value is None:
            return None

        try:
            return datetime.strptime(value, "%d.%m.%Y")
        except ValueError as exc:
            raise ValueError(f"invalid_date_format:{field_name}") from exc

    # --------- ЧТЕНИЕ ---------

    async def list_open(
        self,
        q: Optional[str],
        limit: int,
        offset: int,
    ) -> HackathonListResult:
        """
        Список открытых хакатонов (status = 'open') с простым текстовым фильтром.
        """
        items = await self.repo.list_open(q=q, limit=limit, offset=offset)
        return HackathonListResult(items=items, limit=limit, offset=offset)

    async def get_by_id(self, hackathon_id: int) -> Optional[m_hack.Hackathon]:
        """Вернуть хакатон по id (или None)."""
        return await self.repo.get_by_id(hackathon_id)

    # --------- СОЗДАНИЕ ---------

    async def create_from_payload(self, raw: dict[str, Any]) -> m_hack.Hackathon:
        """
        Создать хакатон из "сырого" payload'а (например, payload.model_dump()).

        Ожидает поля:
          • name, description, mode, status, city, team_members_minimum,
            team_members_limit, registration_link, prize_fund
          • start_date, end_date, registration_end_date — в формате dd.mm.yyyy
          • image_file_id (опционально) — Telegram file_id для обложки

        Поведение:
          1) Парсим даты.
          2) Создаём запись через repo.create.
          3) Если есть image_file_id — качаем из Telegram, заливаем в S3 и
             обновляем image_link через repo.update.
        """
        data = dict(raw)

        image_file_id = data.pop("image_file_id", None) or None  # пустые строки → None

        data["start_date"] = self._parse_ddmmyyyy(data.get("start_date"), "start_date")
        data["end_date"] = self._parse_ddmmyyyy(data.get("end_date"), "end_date")
        data["registration_end_date"] = self._parse_ddmmyyyy(
            data.get("registration_end_date"),
            "registration_end_date",
        )

        hackathon = await self.repo.create(**data)

        if image_file_id:
            file_bytes, content_type = download_telegram_file(image_file_id)
            image_url = upload_hackathon_image_from_bytes(
                hackathon_id=hackathon.id,
                data=file_bytes,
                content_type=content_type,
            )
            hackathon = await self.repo.update(hackathon.id, image_link=image_url)

        return hackathon

    # --------- ОБНОВЛЕНИЕ ---------

    async def update_from_payload(
        self,
        hackathon_id: int,
        raw: dict[str, Any],
    ) -> Optional[m_hack.Hackathon]:
        """
        Частичное обновление хакатона.

        raw — dict с полями, которые нужно обновить (например, payload.model_dump(exclude_unset=True)).

        Если есть date-поля — ожидается формат dd.mm.yyyy, мы его парсим.
        Возвращает обновлённый объект или None, если хакатон не найден.
        """
        if not raw:
            return await self.repo.get_by_id(hackathon_id)

        data = dict(raw)

        for field_name in ("start_date", "end_date", "registration_end_date"):
            if field_name in data:
                data[field_name] = self._parse_ddmmyyyy(
                    data[field_name],
                    field_name,
                )

        return await self.repo.update(hackathon_id, **data)

    # --------- ОБНОВЛЕНИЕ КАРТИНКИ ---------

    async def upload_image_from_uploadfile(
        self,
        hackathon_id: int,
        file: UploadFile,
    ) -> Optional[m_hack.Hackathon]:
        """
        Загрузить/обновить обложку хакатона из обычного файла (multipart/form-data).
        """
        hackathon = await self.repo.get_by_id(hackathon_id)
        if not hackathon:
            return None

        image_url = upload_hackathon_image_to_s3(
            hackathon_id=hackathon_id,
            file=file,
        )

        return await self.repo.update(hackathon_id, image_link=image_url)

    # --------- УДАЛЕНИЕ ---------

    async def delete(self, hackathon_id: int) -> bool:
        """Удалить хакатон по id."""
        return await self.repo.delete(hackathon_id)
