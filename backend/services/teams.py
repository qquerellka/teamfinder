from __future__ import annotations
from typing import Optional, List

from backend.repositories.teams import TeamsRepo
from backend.persistend.enums import TeamStatus
from backend.persistend.models.team import Team


class TeamsService:
    """
    Тонкий сервис для работы с командами.
    Бизнес-правила (кто капитан, можно ли редактировать и т.п.)
    сейчас реализованы в роутерах.
    """

    def __init__(self) -> None:
        self.repo = TeamsRepo()

    async def get_by_id(self, team_id: int) -> Optional[Team]:
        return await self.repo.get_by_id(team_id)

    async def list_by_hackathon(
        self,
        *,
        hackathon_id: int,
        status: Optional[TeamStatus],
        q: Optional[str],
        owner_id: Optional[int],
        member_user_id: Optional[int],
        limit: int,
        offset: int,
        sort: Optional[str],
    ) -> List[Team]:
        return await self.repo.list_by_hackathon(
            hackathon_id=hackathon_id,
            status=status,
            q=q,
            owner_id=owner_id,
            member_user_id=member_user_id,
            limit=limit,
            offset=offset,
            sort=sort,
        )

    async def list_by_user(
        self,
        *,
        user_id: int,
        limit: int,
        offset: int,
    ) -> List[Team]:
        return await self.repo.list_by_user(
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

    async def user_has_team_on_hackathon(
        self,
        *,
        user_id: int,
        hackathon_id: int,
    ) -> bool:
        return await self.repo.user_has_team_on_hackathon(
            user_id=user_id,
            hackathon_id=hackathon_id,
        )

    async def create_with_captain(
        self,
        *,
        hackathon_id: int,
        captain_id: int,
        name: str,
        description: Optional[str],
        captain_role,
    ) -> Team:
        return await self.repo.create_with_captain(
            hackathon_id=hackathon_id,
            captain_id=captain_id,
            name=name,
            description=description,
            captain_role=captain_role,
        )

    async def update(self, team_id: int, data: dict) -> Optional[Team]:
        return await self.repo.update(team_id, data)

    async def delete(self, team_id: int) -> bool:
        return await self.repo.delete(team_id)
