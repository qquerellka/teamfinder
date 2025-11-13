from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.persistend.models.hackathon import Hackathon


class HackathonsRepo:
    def __init__(self, session: AsyncSession):
        self._session = session

    @property
    def session(self) -> AsyncSession:
        return self._session

    async def get_all_hackathons(self) -> List[Hackathon]:
        result = await self._session.execute(select(Hackathon))
        return result.scalars().all()

    async def get_hackathon_by_id(self, hackathon_id: int) -> Optional[Hackathon]:
        return await self._session.get(Hackathon, hackathon_id)

    async def get_active_hackathons(self) -> List[Hackathon]:
        result = await self._session.execute(
            select(Hackathon).where(Hackathon.status == 'open')
        )
        return result.scalars().all()

    async def get_hackathons_by_city(self, city: str) -> List[Hackathon]:
        result = await self._session.execute(
            select(Hackathon).where(Hackathon.city == city)
        )
        return result.scalars().all()

    async def get_online_hackathons(self) -> List[Hackathon]:
        result = await self._session.execute(
            select(Hackathon).where(Hackathon.mode == 'online')
        )
        return result.scalars().all()

    async def create_hackathon(self, hackathon_data: dict) -> Hackathon:
        hackathon = Hackathon(**hackathon_data)
        self._session.add(hackathon)
        await self._session.flush()  # Отправляем изменения в БД для получения ID
        await self._session.refresh(hackathon)  # Обновляем объект из БД
        return hackathon