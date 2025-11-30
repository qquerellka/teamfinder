from __future__ import annotations

from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

from backend.repositories.skills import SkillsRepo

router = APIRouter(prefix="/skills", tags=["skills"])

skills_repo = SkillsRepo()


class SkillOut(BaseModel):
    id: int
    slug: str
    name: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[SkillOut])
async def list_skills():
    """
    Вернуть все скиллы из справочника.
    """
    rows = await skills_repo.list_all()
    return [SkillOut.model_validate(s) for s in rows]
