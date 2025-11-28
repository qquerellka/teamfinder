from __future__ import annotations
from typing import List, Optional

from backend.repositories.team_members import TeamMembersRepo
from backend.persistend.enums import RoleType
from backend.persistend.models.team_member import TeamMember


class TeamMembersService:
    """
    Тонкий сервис для работы с участниками команды.
    Правила «кто может кого удалять/добавлять» реализованы в роутерах.
    """

    def __init__(self) -> None:
        self.repo = TeamMembersRepo()

    async def list_members(self, team_id: int) -> List[TeamMember]:
        return await self.repo.list_members(team_id)

    async def get_membership(self, team_id: int, user_id: int) -> Optional[TeamMember]:
        return await self.repo.get_membership(team_id, user_id)

    async def add_member(
        self,
        *,
        team_id: int,
        user_id: int,
        role: RoleType,
        is_captain: bool = False,
    ) -> TeamMember:
        return await self.repo.add_member(
            team_id=team_id,
            user_id=user_id,
            role=role,
            is_captain=is_captain,
        )

    async def update_member(
        self,
        *,
        team_id: int,
        user_id: int,
        data: dict,
    ) -> Optional[TeamMember]:
        return await self.repo.update_member(
            team_id=team_id,
            user_id=user_id,
            data=data,
        )

    async def delete_member(self, team_id: int, user_id: int) -> bool:
        return await self.repo.delete_member(team_id, user_id)
