from __future__ import annotations

from typing import Any, List, Optional

from sqlalchemy import select

from backend.repositories.base import BaseRepository
from backend.persistend.models import hackathon as m_hack
from backend.persistend.enums import HackathonStatus


class HackathonsRepo(BaseRepository):
    """Репозиторий для работы с хакатонами."""

    async def get_by_id(self, hackathon_id: int) -> Optional[m_hack.Hackathon]:
        """Вернуть один хакатон по id (или None)."""
        async with self._sm() as s:
            return await s.get(m_hack.Hackathon, hackathon_id)

    async def list_open(
        self,
        q: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[m_hack.Hackathon]:
        """
        Список открытых хакатонов.
        Параметры:
          • q — текстовый фильтр по name/description (ILIKE).
        """
        H = m_hack.Hackathon

        async with self._sm() as s:
            stmt = select(H).where(H.status == HackathonStatus.open)

            if q:
                like = f"%{q}%"
                stmt = stmt.where((H.name.ilike(like)) | (H.description.ilike(like)))

            stmt = stmt.order_by(H.start_date.desc()).limit(limit).offset(offset)
            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def create(self, **data: Any) -> m_hack.Hackathon:
        """
        Создать новый хакатон.
        Ожидает поля модели Hackathon (без id / created_at / updated_at).
        """
        async with self._sm() as s:
            obj = m_hack.Hackathon(**data)
            s.add(obj)
            await s.commit()
            await s.refresh(obj)
            return obj

    async def update(
        self, hackathon_id: int, **fields: Any
    ) -> Optional[m_hack.Hackathon]:
        """
        Частично обновить хакатон.
        Возвращает обновлённый объект или None, если не найден.
        """
        if not fields:
            return await self.get_by_id(hackathon_id)

        async with self._sm() as s:
            obj = await s.get(m_hack.Hackathon, hackathon_id)
            if not obj:
                return None

            for key, value in fields.items():
                setattr(obj, key, value)

            await s.commit()
            await s.refresh(obj)
            return obj

    async def delete(self, hackathon_id: int) -> bool:
        """
        Удалить хакатон по id.
        Возвращает True, если удалён, False — если не найден.
        """
        async with self._sm() as s:
            obj = await s.get(m_hack.Hackathon, hackathon_id)
            if not obj:
                return False

            await s.delete(obj)
            await s.commit()
            return True
