from __future__ import annotations

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel

from presentations.routers.users import get_current_user_id
from persistend.enums import (
    RoleType,
    VacancyStatus,
    ResponseStatus,
    ApplicationStatus,
    HackathonStatus,
)

from services.vacancies import VacanciesService
from services.teams import TeamsService
from services.team_members import TeamMembersService
from services.hackathons import HackathonsService

from repositories.responses import ResponsesRepo
from repositories.applications import ApplicationsRepo
from repositories.users import UsersRepo

router = APIRouter(tags=["vacancies"])

vacancies_service = VacanciesService()
teams_service = TeamsService()
members_service = TeamMembersService()
hackathons_service = HackathonsService()

resp_repo = ResponsesRepo()
apps_repo = ApplicationsRepo()
users_repo = UsersRepo()


# ---- СХЕМЫ ----


class VacancyOut(BaseModel):
    id: int
    team_id: int
    role: RoleType
    description: Optional[str]
    status: VacancyStatus

    class Config:
        from_attributes = True


class VacancyListOut(BaseModel):
    items: List[VacancyOut]
    limit: int
    offset: int


class VacancyCreateIn(BaseModel):
    role: RoleType
    description: Optional[str] = None


class VacancyUpdateIn(BaseModel):
    role: Optional[RoleType] = None
    description: Optional[str] = None
    status: Optional[VacancyStatus] = None


class ResponseUserInfo(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class ResponseOut(BaseModel):
    id: int
    vacancy_id: int
    user: ResponseUserInfo
    status: ResponseStatus

    class Config:
        from_attributes = True


class ResponseListOut(BaseModel):
    items: List[ResponseOut]
    limit: int
    offset: int


class ResponseStatusUpdateIn(BaseModel):
    status: ResponseStatus


# ---- ХЕЛПЕРЫ ----


async def _ensure_team_exists(team_id: int):
    team = await teams_service.get_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="team not found")
    return team


async def _ensure_vacancy_exists(vacancy_id: int):
    vac = await vacancies_service.get_by_id(vacancy_id)
    if not vac:
        raise HTTPException(status_code=404, detail="vacancy not found")
    return vac


async def _ensure_response_exists(response_id: int):
    resp = await resp_repo.get_by_id(response_id)
    if not resp:
        raise HTTPException(status_code=404, detail="response not found")
    return resp


async def _ensure_captain(team, user_id: int):
    if team.captain_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="forbidden: not a captain",
        )


async def _ensure_hackathon_open(hackathon_id: int):
    hack = await hackathons_service.get_by_id(hackathon_id)
    if not hack:
        raise HTTPException(status_code=404, detail="hackathon not found")
    if hack.status != HackathonStatus.open:
        raise HTTPException(status_code=400, detail="hackathon is not open")
    return hack


async def _build_response_card(resp) -> ResponseOut:
    # resp тут уже отсоединён от сессии, поэтому связи трогать нельзя
    user = await users_repo.get_by_id(resp.user_id)
    if not user:
        # что-то совсем странное, но лучше явно уронить 500
        raise HTTPException(status_code=500, detail="user not found for response")

    return ResponseOut(
        id=resp.id,
        vacancy_id=resp.vacancy_id,
        status=resp.status,
        user=ResponseUserInfo(
            id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
        ),
    )

# ---- ВАКАНСИИ КОМАНДЫ ----


@router.get("/teams/{team_id}/vacancies", response_model=VacancyListOut)
async def list_team_vacancies(
    team_id: int = Path(..., ge=1),
    status_param: Optional[VacancyStatus] = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    _ = current_user_id
    team = await _ensure_team_exists(team_id)

    vacs = await vacancies_service.list_for_team(
        team_id=team.id,
        status=status_param,
    )
    items = [VacancyOut.model_validate(v) for v in vacs[offset : offset + limit]]
    return VacancyListOut(items=items, limit=limit, offset=offset)


@router.post(
    "/teams/{team_id}/vacancies",
    response_model=VacancyOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_team_vacancy(
    team_id: int = Path(..., ge=1),
    payload: VacancyCreateIn = ...,
    current_user_id: int = Depends(get_current_user_id),
):
    team = await _ensure_team_exists(team_id)
    await _ensure_captain(team, current_user_id)
    await _ensure_hackathon_open(team.hackathon_id)

    vac = await vacancies_service.create(
        team_id=team.id,
        role=payload.role,
        description=payload.description,
    )
    return VacancyOut.model_validate(vac)


# ---- ОБЩИЙ ЛИСТИНГ ВАКАНСИЙ ----


@router.get("/vacancies", response_model=VacancyListOut)
async def list_all_vacancies(
    role: Optional[RoleType] = Query(default=None),
    hackathon_id: Optional[int] = Query(default=None, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    _ = current_user_id

    if hackathon_id is None:
        raise HTTPException(status_code=400, detail="hackathon_id is required for now")

    await _ensure_hackathon_open(hackathon_id)

    vacs = await vacancies_service.list_for_hackathon(
        hackathon_id=hackathon_id,
        role=role,
        only_open=True,
        limit=limit,
        offset=offset,
    )
    items = [VacancyOut.model_validate(v) for v in vacs]
    return VacancyListOut(items=items, limit=limit, offset=offset)


@router.get("/vacancies/{vacancy_id}", response_model=VacancyOut)
async def get_vacancy(
    vacancy_id: int = Path(..., ge=1),
    current_user_id: int = Depends(get_current_user_id),
):
    _ = current_user_id
    vac = await _ensure_vacancy_exists(vacancy_id)
    return VacancyOut.model_validate(vac)


@router.patch("/vacancies/{vacancy_id}", response_model=VacancyOut)
async def update_vacancy(
    vacancy_id: int = Path(..., ge=1),
    payload: VacancyUpdateIn = ...,
    user_id: int = Depends(get_current_user_id),
):
    vacancy = await _ensure_vacancy_exists(vacancy_id)

    team = await _ensure_team_exists(vacancy.team_id)
    await _ensure_captain(team, user_id)

    fields: dict = {}
    if payload.role is not None:
        fields["role"] = payload.role
    if payload.description is not None:
        fields["description"] = payload.description
    if payload.status is not None:
        fields["status"] = payload.status

    if not fields:
        return VacancyOut.model_validate(vacancy)

    updated = await vacancies_service.update(vacancy_id, fields)
    if not updated:
        raise HTTPException(status_code=404, detail="vacancy not found (update)")

    return VacancyOut.model_validate(updated)


@router.delete("/vacancies/{vacancy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vacancy(
    vacancy_id: int = Path(..., ge=1),
    current_user_id: int = Depends(get_current_user_id),
):
    vac = await _ensure_vacancy_exists(vacancy_id)
    team = await _ensure_team_exists(vac.team_id)
    await _ensure_captain(team, current_user_id)

    ok = await vacancies_service.delete(vacancy_id)
    if not ok:
        raise HTTPException(status_code=404, detail="vacancy not found (delete)")
    return None


@router.get(
    "/hackathons/{hackathon_id}/vacancies",
    response_model=VacancyListOut,
)
async def list_hackathon_vacancies(
    hackathon_id: int = Path(..., ge=1),
    role: Optional[RoleType] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    _ = current_user_id
    await _ensure_hackathon_open(hackathon_id)

    vacs = await vacancies_service.list_for_hackathon(
        hackathon_id=hackathon_id,
        role=role,
        only_open=True,
        limit=limit,
        offset=offset,
    )
    items = [VacancyOut.model_validate(v) for v in vacs]
    return VacancyListOut(items=items, limit=limit, offset=offset)


# ---- ОТКЛИКИ НА ВАКАНСИИ ----


@router.get("/vacancies/{vacancy_id}/responses", response_model=ResponseListOut)
async def list_responses_for_vacancy(
    vacancy_id: int = Path(..., ge=1),
    current_user_id: int = Depends(get_current_user_id),
):
    vac = await _ensure_vacancy_exists(vacancy_id)
    team = await _ensure_team_exists(vac.team_id)
    await _ensure_captain(team, current_user_id)

    resps = await resp_repo.list_for_vacancy(vacancy_id)
    items = [await _build_response_card(r) for r in resps]
    return ResponseListOut(items=items, limit=len(items), offset=0)


@router.post(
    "/vacancies/{vacancy_id}/responses",
    response_model=ResponseOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_response(
    vacancy_id: int = Path(..., ge=1),
    payload: ResponseCreateIn = ...,
    current_user_id: int = Depends(get_current_user_id),
):
    vac = await _ensure_vacancy_exists(vacancy_id)
    if vac.status != VacancyStatus.open:
        raise HTTPException(status_code=400, detail="vacancy is not open")

    team = await _ensure_team_exists(vac.team_id)
    await _ensure_hackathon_open(team.hackathon_id)

    # Пользователь уже в команде на этом хакатоне — откликаться нельзя
    already = await teams_service.user_has_team_on_hackathon(
        user_id=current_user_id,
        hackathon_id=team.hackathon_id,
    )
    if already:
        raise HTTPException(
            status_code=409,
            detail="user already has a team on this hackathon",
        )

    # Нельзя откликнуться дважды на одну и ту же вакансию
    exists = await resp_repo.exists_for_vacancy_and_user(
        vacancy_id=vacancy_id,
        user_id=current_user_id,
    )
    if exists:
        raise HTTPException(
            status_code=409,
            detail="response already exists for this vacancy",
        )

    resp = await resp_repo.create(
        vacancy_id=vacancy_id,
        user_id=current_user_id,
    )

    return await _build_response_card(resp)


@router.get("/responses/{response_id}", response_model=ResponseOut)
async def get_response(
    response_id: int = Path(..., ge=1),
    current_user_id: int = Depends(get_current_user_id),
):
    resp = await _ensure_response_exists(response_id)
    vac = resp.vacancy
    team = await _ensure_team_exists(vac.team_id)

    if resp.user_id != current_user_id and team.captain_id != current_user_id:
        raise HTTPException(status_code=403, detail="forbidden")

    return await _build_response_card(resp)


@router.get("/me/responses", response_model=ResponseListOut)
async def list_my_responses(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user_id: int = Depends(get_current_user_id),
):
    resps = await resp_repo.list_for_user(
        user_id=current_user_id,
        limit=limit,
        offset=offset,
    )
    items = [await _build_response_card(r) for r in resps]
    return ResponseListOut(items=items, limit=limit, offset=offset)


@router.patch("/responses/{response_id}", response_model=ResponseOut)
async def update_response_status(
    response_id: int = Path(..., ge=1),
    payload: ResponseStatusUpdateIn = ...,
    current_user_id: int = Depends(get_current_user_id),
):
    resp = await _ensure_response_exists(response_id)
    vac = resp.vacancy
    team = await _ensure_team_exists(vac.team_id)

    new_status = payload.status

    if new_status in (ResponseStatus.accepted, ResponseStatus.rejected):
        await _ensure_captain(team, current_user_id)
    elif new_status is ResponseStatus.withdrawn:
        if resp.user_id != current_user_id:
            raise HTTPException(status_code=403, detail="forbidden")
    else:
        raise HTTPException(status_code=400, detail="unsupported status change")

    if new_status == ResponseStatus.accepted:
        user_id = resp.user_id

        already = await teams_service.user_has_team_on_hackathon(
            user_id=user_id,
            hackathon_id=team.hackathon_id,
        )
        if already:
            raise HTTPException(
                status_code=409, detail="user already has a team on this hackathon"
            )

        # добавляем пользователя в команду с ролью из вакансии
        await members_service.add_member(
            team_id=team.id,
            user_id=user_id,
            role=vac.role,
            is_captain=False,
        )

        # закрываем вакансию
        await vacancies_service.update(
            vacancy_id=vac.id,
            fields={"status": VacancyStatus.closed},
        )

        # скрываем анкету пользователя по этому хаку (если есть)
        app = await apps_repo.get_by_user_and_hackathon(
            user_id=user_id,
            hackathon_id=team.hackathon_id,
        )
        if app:
            await apps_repo.update(
                app_id=app.id,
                data={"status": ApplicationStatus.hidden, "joined": True},
            )

        # гасим другие pending-отклики пользователя по этому хаку
        await resp_repo.expire_other_pending_for_user_on_hackathon(
            user_id=user_id,
            hackathon_id=team.hackathon_id,
            except_response_id=resp.id,
        )
        # TODO: погасить pending-инвайты и разослать уведомления.

    if new_status == ResponseStatus.withdrawn:
        if resp.status != ResponseStatus.pending:
            raise HTTPException(
                status_code=400, detail="only pending response can be withdrawn"
            )

    updated = await resp_repo.update_status(response_id=response_id, status=new_status)
    if not updated:
        raise HTTPException(
            status_code=404, detail="response not found (update_status)"
        )

    return await _build_response_card(updated)


@router.delete("/responses/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_response(
    response_id: int = Path(..., ge=1),
    current_user_id: int = Depends(get_current_user_id),
):
    resp = await _ensure_response_exists(response_id)

    if resp.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="forbidden")

    if resp.status != ResponseStatus.pending:
        raise HTTPException(
            status_code=400, detail="only pending response can be withdrawn"
        )

    await resp_repo.update_status(
        response_id=response_id,
        status=ResponseStatus.withdrawn,
    )
    return None
