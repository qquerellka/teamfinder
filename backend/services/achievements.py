from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

from backend.persistend.enums import AchievementPlace, RoleType
from backend.persistend.models import achievement as m_ach
from backend.repositories.achievements import AchievementsRepo


@dataclass(frozen=True)
class AchievementsListResult:
    items: List[m_ach.Achievement]
    total: int


class AchievementsService:
    """
    Сервисный слой для достижений.

    Отвечает за:
      • инвариант «не более одного достижения на (user_id, hackathon_id)», если нужен жёсткий create;
      • удобные методы для «моих достижений» и достижений по хакатону;
      • обёртку над репозиторием, чтобы роуты работали с простыми методами сервиса.
    """

    def __init__(self) -> None:
        self.repo = AchievementsRepo()

    # ---------- СПИСКИ ----------

    async def list_for_user(
        self,
        user_id: int,
        *,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
        limit: int = 50,
        offset: int = 0,
        with_hackathon: bool = False,
    ) -> AchievementsListResult:
        items, total = await self.repo.list_by_user(
            user_id=user_id,
            role=role,
            place=place,
            limit=limit,
            offset=offset,
            with_hackathon=with_hackathon,
        )
        return AchievementsListResult(items=items, total=total)

    async def list_for_hackathon(
        self,
        hackathon_id: int,
        *,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
        limit: int = 50,
        offset: int = 0,
        with_user: bool = False,
    ) -> AchievementsListResult:
        items, total = await self.repo.list_by_hackathon(
            hackathon_id=hackathon_id,
            role=role,
            place=place,
            limit=limit,
            offset=offset,
            with_user=with_user,
        )
        return AchievementsListResult(items=items, total=total)

    # ---------- СОЗДАНИЕ / UPSERT ----------

    async def create_for_user_hack(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: RoleType,
        place: AchievementPlace = AchievementPlace.participant,
    ) -> m_ach.Achievement:
        """
        Жёсткий create: если достижение уже есть — ValueError("duplicate_achievement").
        Роутер может маппить это в HTTP 409.
        """
        return await self.repo.create(
            user_id=user_id,
            hackathon_id=hackathon_id,
            role=role,
            place=place,
        )

    async def upsert_for_user_hack(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
    ) -> m_ach.Achievement:
        """
        Идемпотентная операция:
          • если записи ещё нет — создаёт;
          • если есть — обновляет только переданные поля.
        """
        return await self.repo.upsert_for_user_hack(
            user_id=user_id,
            hackathon_id=hackathon_id,
            role=role,
            place=place,
        )

    # ---------- ЧТЕНИЕ ОДНОЙ ЗАПИСИ ----------

    async def get(self, ach_id: int) -> Optional[m_ach.Achievement]:
        return await self.repo.get_by_id(ach_id)

    # ---------- ОБНОВЛЕНИЕ / УДАЛЕНИЕ ----------

    async def update(
        self,
        ach_id: int,
        *,
        role: Optional[RoleType] = None,
        place: Optional[AchievementPlace] = None,
    ) -> Optional[m_ach.Achievement]:
        """
        Обновить достижение. Если ничего не передано — вернёт текущую версию, если она есть.
        """
        return await self.repo.update(
            ach_id,
            role=role,
            place=place,
        )

    async def delete(self, ach_id: int) -> bool:
        """Удалить достижение по id. Возвращает True, если что-то удалили."""
        return await self.repo.delete_by_id(ach_id)

    async def delete_for_user_in_hack(
        self,
        user_id: int,
        hackathon_id: int,
    ) -> int:
        """
        Удалить все достижения пользователя в хакатоне.
        Удобно для сценариев «передобавить достижения» или «сбросить прогресс».
        """
        return await self.repo.delete_for_user_in_hack(
            user_id=user_id,
            hackathon_id=hackathon_id,
        )

    # ---------- АГРЕГАТЫ ----------

    async def stats_by_place_for_hack(
        self,
        hackathon_id: int,
    ) -> List[tuple[AchievementPlace, int]]:
        """
        Распределение достижений по place в рамках хакатона.
        Можно использовать для админки/дашбордов.
        """
        return await self.repo.stats_by_place_for_hack(hackathon_id)
