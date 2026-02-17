from __future__ import annotations

from typing import Any, List, Optional, Sequence

from sqlalchemy import select

from repositories.base import BaseRepository
from persistent.models import hackathon as m_hack
from persistent.enums import HackathonStatus, HackathonMode, HackathonTrack, HackathonsStatusFilter


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
        hackathon_mode: Optional[HackathonMode] = None,
        with_prize_fund: Optional[bool] = None,
        tracks: Optional[Sequence[HackathonTrack]] = None,
        status: Optional[HackathonsStatusFilter] = HackathonsStatusFilter.open,
    ) -> List[m_hack.Hackathon]:
        """
        Список открытых хакатонов.
        Параметры:
          q - текстовый фильтр по name/description (ILIKE)
          hackathon_mode - фильтр по формату хакатона
          with_prize_fund - есть ли призовой фонд 
        """
        H = m_hack.Hackathon

        async with self._sm() as s:
            stmt = select(H)
            if status == HackathonsStatusFilter.open:
                stmt = stmt.where(H.status == HackathonStatus.open)
            elif status == HackathonsStatusFilter.closed:
                stmt = stmt.where(H.status == HackathonStatus.closed)

            if q:
                like = f"%{q}%"
                stmt = stmt.where((H.name.ilike(like)) | (H.description.ilike(like)))
                
            if hackathon_mode:
                stmt = stmt.where(H.mode == hackathon_mode)
                
            if with_prize_fund is not None:
                if with_prize_fund:
                    stmt = stmt.where(H.prize_fund.is_not(None))
                else:
                    stmt = stmt.where(H.prize_fund.is_(None))
                    
            if tracks:
                stmt = stmt.where(H.tracks.overlap(list(tracks)))
            
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
