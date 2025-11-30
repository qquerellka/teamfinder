from __future__ import annotations

from typing import List

from sqlalchemy import select

from backend.repositories.base import BaseRepository
from backend.persistend.models.skill import Skill  # модель skills


class SkillsRepo(BaseRepository):
    async def list_all(self) -> List[Skill]:
        S = Skill
        async with self._sm() as s:
            stmt = select(S).order_by(S.name.asc())
            res = await s.execute(stmt)
            return list(res.scalars().all())
