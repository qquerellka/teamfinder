from __future__ import annotations

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from pydantic import BaseModel, Field

from backend.persistend.enums import TeamStatus, RoleType, HackathonStatus
from backend.presentations.routers.users import get_current_user_id
from backend.repositories.teams import TeamsRepo, TeamMembersRepo
from backend.repositories.hackathons import HackathonsRepo
from backend.repositories.users import UsersRepo
from backend.repositories.applications import ApplicationsRepo

router = APIRouter(tags=["teams"])

teams_repo = TeamsRepo()
members_repo = TeamMembersRepo()
hacks_repo = HackathonsRepo()
users_repo = UsersRepo()
apps_repo = ApplicationsRepo()


class TeamOut(BaseModel):
    id: int
    hackathon_id: int
    name: str
    description: Optional[str]
    captain_id: int
    status: TeamStatus

    class Config:
        from_attributes = True


class TeamListOut(BaseModel):
    items: List[TeamOut]
    limit: int
    offset: int


class TeamCreateIn(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    role: RoleType  


class TeamUpdateIn(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TeamStatus] = None


class TeamMemberUserOut(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class TeamMemberOut(BaseModel):
    user: TeamMemberUserOut
    role: RoleType
    is_captain: bool

    class Config:
        from_attributes = True


class TeamMembersListOut(BaseModel):
    items: List[TeamMemberOut]


class TeamMemberCreateIn(BaseModel):
    user_id: int
    role: RoleType


class TeamMemberUpdateIn(BaseModel):
    role: Optional[RoleType] = None
    is_captain: Optional[bool] = None


async def _ensure_hackathon_exists(hackathon_id: int):
    hack = await hacks_repo.get_by_id(hackathon_id)
    if not hack:
        raise HTTPException(status_code=404, detail="hackathon not found")
    return hack


async def _ensure_team_exists(team_id: int):
    team = await teams_repo.get_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="team not found")
    return team


async def _ensure_captain(team, user_id: int):
    if team.captain_id != user_id:
        raise HTTPException(status_code=403, detail="forbidden: not a captain")


@router.get("/hackathons/{hackathon_id}/teams", response_model=TeamListOut)
async def list_teams(
    hackathon_id: int = Path(..., ge=1),
    status_param: Optional[TeamStatus] = Query(default=None, alias="status"),
    q: Optional[str] = Query(default=None),
    owner_id: Optional[int] = Query(default=None, ge=1),
    member: Optional[str] = Query(default=None),
    sort: Optional[str] = Query(default="-created_at"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    await _ensure_hackathon_exists(hackathon_id)

    member_user_id: Optional[int] = None
    if member:
        if member == "me":
            member_user_id = current_user_id
        else:
            try:
                member_user_id = int(member)
            except ValueError:
                raise HTTPException(status_code=400, detail="member must be 'me' or integer user_id")

    teams = await teams_repo.list_by_hackathon(
        hackathon_id=hackathon_id,
        status=status_param,
        q=q,
        owner_id=owner_id,
        member_user_id=member_user_id,
        limit=limit,
        offset=offset,
        sort=sort,
    )

    return TeamListOut(
        items=[TeamOut.model_validate(t) for t in teams],
        limit=limit,
        offset=offset,
    )


@router.post(
    "/hackathons/{hackathon_id}/teams",
    response_model=TeamOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_team(
    hackathon_id: int = Path(..., ge=1),
    payload: TeamCreateIn = ...,
    user_id: int = Depends(get_current_user_id),
):
    # 1. Проверяем, что хакатон существует и открыт
    hack = await _ensure_hackathon_exists(hackathon_id)
    if hack.status != HackathonStatus.open:
        raise HTTPException(status_code=400, detail="hackathon is not open")

    # 2. Проверяем, что у пользователя ещё нет команды на этом хакатоне
    already = await teams_repo.user_has_team_on_hackathon(
        user_id=user_id,
        hackathon_id=hackathon_id,
    )
    if already:
        raise HTTPException(
            status_code=409,
            detail="user already has a team on this hackathon",
        )

    # 3. Создаём команду и сразу добавляем создателя как капитана
    team = await teams_repo.create_with_captain(
        hackathon_id=hackathon_id,
        captain_id=user_id,
        name=payload.name,
        description=payload.description,
        captain_role=payload.role,   # роль берём из тела запроса
    )

    return TeamOut.model_validate(team)


@router.get("/me/teams", response_model=TeamListOut)
async def list_my_teams(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: int = Depends(get_current_user_id),
):
    teams = await teams_repo.list_by_user(user_id=user_id, limit=limit, offset=offset)
    return TeamListOut(
        items=[TeamOut.model_validate(t) for t in teams],
        limit=limit,
        offset=offset,
    )


@router.get("/hackathons/{hackathon_id}/teams/me", response_model=TeamListOut)
async def list_my_teams_on_hackathon(
    hackathon_id: int = Path(..., ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: int = Depends(get_current_user_id),
):
    await _ensure_hackathon_exists(hackathon_id)
    teams = await teams_repo.list_by_hackathon(
        hackathon_id=hackathon_id,
        status=None,
        q=None,
        owner_id=None,
        member_user_id=user_id,
        limit=limit,
        offset=offset,
        sort="-created_at",
    )
    return TeamListOut(
        items=[TeamOut.model_validate(t) for t in teams],
        limit=limit,
        offset=offset,
    )


@router.get("/teams/{team_id}", response_model=TeamOut)
async def get_team(team_id: int = Path(..., ge=1)):
    team = await teams_repo.get_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="team not found")
    return TeamOut.model_validate(team)


@router.patch("/teams/{team_id}", response_model=TeamOut)
async def update_team(
    team_id: int = Path(..., ge=1),
    payload: TeamUpdateIn = ...,
    user_id: int = Depends(get_current_user_id),
):
    team = await _ensure_team_exists(team_id)
    await _ensure_captain(team, user_id)

    data = payload.model_dump(exclude_unset=True)
    updated = await teams_repo.update(team_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="team not found (update)")
    return TeamOut.model_validate(updated)


@router.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: int = Path(..., ge=1),
    user_id: int = Depends(get_current_user_id),
):
    team = await _ensure_team_exists(team_id)
    await _ensure_captain(team, user_id)

    ok = await teams_repo.delete(team_id)
    if not ok:
        raise HTTPException(status_code=404, detail="team not found (delete)")
    return None


@router.get("/teams/{team_id}/members", response_model=TeamMembersListOut)
async def list_team_members(team_id: int = Path(..., ge=1)):
    team = await _ensure_team_exists(team_id)
    _ = team

    members = await members_repo.list_members(team_id)
    items: List[TeamMemberOut] = []
    for m in members:
        u = m.user
        items.append(
            TeamMemberOut(
                user=TeamMemberUserOut(
                    id=u.id,
                    username=u.username,
                    first_name=u.first_name,
                    last_name=u.last_name,
                ),
                role=m.role,
                is_captain=m.is_captain,
            )
        )
    return TeamMembersListOut(items=items)


@router.post(
    "/teams/{team_id}/members",
    response_model=TeamMemberOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_team_member(
    team_id: int = Path(..., ge=1),
    payload: TeamMemberCreateIn = ...,
    current_user_id: int = Depends(get_current_user_id),
):
    team = await _ensure_team_exists(team_id)
    await _ensure_captain(team, current_user_id)

    user = await users_repo.get_by_id(payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    already = await teams_repo.user_has_team_on_hackathon(
        user_id=payload.user_id,
        hackathon_id=team.hackathon_id,
    )
    if already:
        raise HTTPException(status_code=409, detail="user already has a team on this hackathon")

    membership = await members_repo.add_member(
        team_id=team_id,
        user_id=payload.user_id,
        role=payload.role,
        is_captain=False,
    )

    return TeamMemberOut(
        user=TeamMemberUserOut(
            id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
        ),
        role=membership.role,
        is_captain=membership.is_captain,
    )


@router.patch("/teams/{team_id}/members/{user_id}", response_model=TeamMemberOut)
async def update_team_member(
    team_id: int = Path(..., ge=1),
    user_id: int = Path(..., ge=1),
    payload: TeamMemberUpdateIn = ...,
    current_user_id: int = Depends(get_current_user_id),
):
    team = await _ensure_team_exists(team_id)
    await _ensure_captain(team, current_user_id)

    data = payload.model_dump(exclude_unset=True)
    membership = await members_repo.update_member(
        team_id=team_id,
        user_id=user_id,
        data=data,
    )
    if not membership:
        raise HTTPException(status_code=404, detail="team member not found")

    user = await users_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found for member")

    return TeamMemberOut(
        user=TeamMemberUserOut(
            id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
        ),
        role=membership.role,
        is_captain=membership.is_captain,
    )


@router.delete("/teams/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    team_id: int = Path(..., ge=1),
    user_id: int = Path(..., ge=1),
    current_user_id: int = Depends(get_current_user_id),
):
    team = await _ensure_team_exists(team_id)
    await _ensure_captain(team, current_user_id)

    ok = await members_repo.delete_member(team_id, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="team member not found (delete)")
    return None


@router.delete("/teams/{team_id}/members/me", status_code=status.HTTP_204_NO_CONTENT)
async def leave_team(
    team_id: int = Path(..., ge=1),
    current_user_id: int = Depends(get_current_user_id),
):
    team = await _ensure_team_exists(team_id)
    membership = await members_repo.get_membership(team_id, current_user_id)
    if not membership:
        raise HTTPException(status_code=404, detail="you are not a member of this team")

    if membership.is_captain:
        raise HTTPException(
            status_code=400,
            detail="captain cannot leave team directly (use captain transfer logic / admin tools)",
        )

    ok = await members_repo.delete_member(team_id, current_user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="team member not found (leave)")
    return None
