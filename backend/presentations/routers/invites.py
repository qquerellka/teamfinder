from __future__ import annotations

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from persistend.enums import InviteStatus, RoleType
from services.invites import InvitesService, InviteWithContext
from presentations.routers.users import get_current_user_id

from repositories.teams import TeamsRepo
from repositories.applications import ApplicationsRepo

router = APIRouter(tags=["invites"])

invites_service = InvitesService()
teams_repo = TeamsRepo()
apps_repo = ApplicationsRepo()


# ---- схемы ----

class InviteCreateIn(BaseModel):
    application_id: int
    invited_role: RoleType


class InviteOut(BaseModel):
    id: int
    status: InviteStatus
    invited_role: RoleType
    team_id: int
    application_id: int


class TeamInviteOut(InviteOut):
    application_user_id: int
    user_name: Optional[str] = None


class ApplicationInviteOut(InviteOut):
    team_name: str


class MyInviteOut(InviteOut):
    team_name: str
    hackathon_id: int


# ---- helpers ----

async def _pack_invite_for_team(inv, app) -> TeamInviteOut:
    # app.user_id, username/имя можно вынуть через UsersRepo при желании
    return TeamInviteOut(
        id=inv.id,
        status=inv.status,
        invited_role=inv.invited_role,
        team_id=inv.team_id,
        application_id=inv.application_id,
        application_user_id=app.user_id,
        user_name=None,  # можно дообогатить через UsersRepo
    )


async def _pack_invite_for_application(inv, team) -> ApplicationInviteOut:
    return ApplicationInviteOut(
        id=inv.id,
        status=inv.status,
        invited_role=inv.invited_role,
        team_id=inv.team_id,
        application_id=inv.application_id,
        team_name=team.name,
    )


async def _pack_my_invite(ctx: InviteWithContext) -> MyInviteOut:
    inv = ctx.invite
    team = ctx.team
    hack = ctx.hackathon

    return MyInviteOut(
        id=inv.id,
        status=inv.status,
        invited_role=inv.invited_role,
        team_id=inv.team_id,
        application_id=inv.application_id,
        team_name=team.name,
        hackathon_id=hack.id,
    )


# ---- POST /teams/{team_id}/invites ----

@router.post(
    "/teams/{team_id}/invites",
    response_model=InviteOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_invite_for_team(
    team_id: int,
    payload: InviteCreateIn,
    current_user_id: int = Depends(get_current_user_id),
):
    try:
        inv = await invites_service.create_for_team(
            current_user_id=current_user_id,
            team_id=team_id,
            application_id=payload.application_id,
            invited_role=payload.invited_role,
        )
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
    except ValueError as e:
        code = str(e)
        if code in {
            "team_not_found",
            "application_not_found",
        }:
            raise HTTPException(status_code=404, detail=code)
        if code in {
            "different_hackathon",
            "user_already_in_this_team",
            "user_already_in_team_for_hackathon",
            "application_already_has_accepted_invite",
            "invite_already_exists",
        }:
            raise HTTPException(status_code=409, detail=code)
        raise HTTPException(status_code=400, detail=code)

    return InviteOut(
        id=inv.id,
        status=inv.status,
        invited_role=inv.invited_role,
        team_id=inv.team_id,
        application_id=inv.application_id,
    )


# ---- GET /teams/{team_id}/invites ----

@router.get("/teams/{team_id}/invites", response_model=List[TeamInviteOut])
async def list_team_invites(
    team_id: int,
    status_param: Optional[InviteStatus] = Query(
        default=None, alias="status", description="Фильтр по статусу",
    ),
    current_user_id: int = Depends(get_current_user_id),
):
    try:
        invites = await invites_service.list_for_team_for_captain(
            current_user_id=current_user_id,
            team_id=team_id,
            status=status_param,
        )
    except ValueError as e:
        if str(e) == "team_not_found":
            raise HTTPException(status_code=404, detail="team_not_found")
        raise
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")

    # обогащаем анкетами
    out: List[TeamInviteOut] = []
    for inv in invites:
        app = await apps_repo.get_by_id(inv.application_id)
        if not app:
            # "висячий" инвайт, теоретически не должно быть
            continue
        out.append(await _pack_invite_for_team(inv, app))

    return out


# ---- GET /applications/{application_id}/invites ----

@router.get(
    "/applications/{application_id}/invites",
    response_model=List[ApplicationInviteOut],
)
async def list_application_invites(
    application_id: int,
    status_param: Optional[InviteStatus] = Query(
        default=None, alias="status", description="Фильтр по статусу",
    ),
    current_user_id: int = Depends(get_current_user_id),
):
    try:
        invites = await invites_service.list_for_application_for_owner(
            current_user_id=current_user_id,
            application_id=application_id,
            status=status_param,
        )
    except ValueError as e:
        if str(e) == "application_not_found":
            raise HTTPException(status_code=404, detail="application_not_found")
        raise
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")

    out: List[ApplicationInviteOut] = []
    for inv in invites:
        team = await teams_repo.get_by_id(inv.team_id)
        if not team:
            continue
        out.append(await _pack_invite_for_application(inv, team))

    return out


# ---- GET /me/invites ----

@router.get("/me/invites", response_model=List[MyInviteOut])
async def list_my_invites(
    hackathon_id: Optional[int] = Query(default=None),
    status_param: Optional[InviteStatus] = Query(default=None, alias="status"),
    current_user_id: int = Depends(get_current_user_id),
):
    invites = await invites_service.list_for_user(
        current_user_id=current_user_id,
        hackathon_id=hackathon_id,
        status=status_param,
    )

    out: List[MyInviteOut] = []
    for inv in invites:
        ctx = await invites_service.get_for_user(
            current_user_id=current_user_id,
            invite_id=inv.id,
        )
        out.append(await _pack_my_invite(ctx))

    return out


# ---- GET /invites/{invite_id} ----

@router.get("/invites/{invite_id}", response_model=MyInviteOut)
async def get_invite(
    invite_id: int,
    current_user_id: int = Depends(get_current_user_id),
):
    try:
        ctx = await invites_service.get_for_user(
            current_user_id=current_user_id,
            invite_id=invite_id,
        )
    except ValueError as e:
        if str(e) == "invite_not_found":
            raise HTTPException(status_code=404, detail="invite_not_found")
        raise
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")

    return await _pack_my_invite(ctx)


# ---- PATCH /invites/{invite_id} ----

class InviteStatusPatchIn(BaseModel):
    status: InviteStatus = Field(..., description="'accepted' или 'rejected'")


@router.patch("/invites/{invite_id}", response_model=InviteOut)
async def patch_invite_status(
    invite_id: int,
    payload: InviteStatusPatchIn,
    current_user_id: int = Depends(get_current_user_id),
):
    try:
        inv = await invites_service.change_status_by_owner(
            current_user_id=current_user_id,
            invite_id=invite_id,
            new_status=payload.status,
        )
    except PermissionError:
        raise HTTPException(status_code=403, detail="forbidden")
    except ValueError as e:
        code = str(e)
        if code == "invite_not_found":
            raise HTTPException(status_code=404, detail=code)
        if code in {"invite_not_pending", "invite_expired"}:
            raise HTTPException(status_code=409, detail=code)
        if code == "invalid_status":
            raise HTTPException(status_code=400, detail=code)
        raise HTTPException(status_code=400, detail=code)

    return InviteOut(
        id=inv.id,
        status=inv.status,
        invited_role=inv.invited_role,
        team_id=inv.team_id,
        application_id=inv.application_id,
    )
