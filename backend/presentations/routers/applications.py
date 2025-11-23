# =============================================================================
# ФАЙЛ: backend/presentations/routers/applications.py
# КРАТКО: роутер FastAPI для анкет пользователей на хакатоны (Application).
#
# ЗАЧЕМ НУЖЕН:
#   • Позволяет пользователю создать/посмотреть/обновить свою анкету на конкретном хакатоне.
#   • Даёт другим пользователям/капитанам список анкет по хакатону с простыми фильтрами.
#   • Возвращает «карточку анкеты», собранную из нескольких таблиц:
#       - application: id, hackathon_id, user_id, role
#       - users: username, first_name, last_name
#       - user_skill/skill: skills[]
#       - hackathon: registration_end_date
#
# ОСОБЕННОСТИ:
#   • Аутентификация через JWT (get_current_user_id) — без токена/с битым токеном сюда не попасть.
#   • На один хакатон у пользователя может быть только 1 анкета (валидируем это).
#   • Фильтры по списку: role (Enum) и q (поиск по username/first_name/last_name).
#   • skills в карточке подтягиваются из профиля (user_id), отдельно от анкеты (MVP).
#   • Ответы типизированы Pydantic-схемами — это видно во /docs (Swagger).
#
# ПАГИНАЦИЯ:
#   • Списки возвращают объект-обёртку:
#       { "items": [...], "limit": X, "offset": Y }
#
# ДОГОВОР С ФРОНТОМ (ApplicationCardOut):
#   • id, hackathon_id, user_id, role
#   • username, first_name, last_name
#   • skills[]: { id, slug, name }
#   • registration_end_date: ISO-строка или null
# =============================================================================

from __future__ import annotations # Отложенная оценка аннотаций (удобно для типов/ORM)


from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status # FastAPI-примитивы
from pydantic import BaseModel, Field # Pydantic-схемы для валидации/документации

# Зависимость, которая по JWT-токену достаёт user_id (используется во всех ручках)
from backend.presentations.routers.users import get_current_user_id

# Репозитории — слой доступа к БД
from backend.repositories.users import UsersRepo
from backend.repositories.hackathons import HackathonsRepo
from backend.repositories.applications import ApplicationsRepo

# Enum-типы ролей и статуса анкеты (должны совпадать с ENUM в БД)
from backend.persistend.enums import RoleType, ApplicationStatus

# Инициализируем роутер FastAPI.
# tags=["applications"] — так будет отображаться секция в Swagger (/docs)
router = APIRouter(tags=["applications"])

# Создаём экземпляры репозиториев для работы в роутере.
# Каждый метод репозитория сам открывает/закрывает краткоживущую async-сессию
users_repo = UsersRepo()
hacks_repo = HackathonsRepo()
apps_repo  = ApplicationsRepo()

# ---- СХЕМЫ ----

class SkillOut(BaseModel):
    """Выходная схема одного навыка в карточке анкеты."""
    id: int
    slug: str
    name: str

class ApplicationCardOut(BaseModel):
    """
    Карточка анкеты (то, что видит фронтенд).
    Собирается не из одной таблицы, а из нескольких:
      • application: id, hackathon_id, user_id, role
      • users: username, first_name, last_name
      • user_skill/skill: skills[]
      • hackathon: registration_end_date
    """
    id: int
    hackathon_id: int
    user_id: int
    role: Optional[RoleType] = None

    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    skills: List[SkillOut] = Field(default_factory=list)
    registration_end_date: Optional[str] = None  # ISO-строка

class ApplicationCreateIn(BaseModel):
    """Тело POST: создать анкету на хакатон."""
    role: Optional[RoleType] = None

class ApplicationPatchIn(BaseModel):
    """Тело PATCH: частично обновить мою анкету на хакатон."""
    role: Optional[RoleType] = None
    status: Optional[ApplicationStatus] = None

# ---- ВСПОМОГАТЕЛЬНАЯ СБОРКА КАРТОЧКИ ----

async def _pack_application_card(app_obj) -> ApplicationCardOut:
    """
    Сборка карточки анкеты:
      • из application: id, hackathon_id, user_id, role
      • из users: username, first_name, last_name
      • из user_skill/skill: skills[]
      • из hackathon: registration_end_date

    Принимает:
      • app_obj — ORM-объект Application (из репозитория)

    Возвращает:
      • ApplicationCardOut — типизированный объект для фронта
    """
    # 1) Владелец анкеты (пользователь)
    usr = await users_repo.get_by_id(app_obj.user_id)
    if not usr:
        # Так быть не должно: FK в БД гарантируют целостность.
        # Если всё-таки так случилось — это ошибка данных.
        raise HTTPException(status_code=500, detail="dangling application: user not found")

    # 2) Навыки пользователя (через таблицу user_skill → skill)
    u_skills = await users_repo.get_user_skills(usr.id)
    skills_out = [SkillOut(id=s.id, slug=s.slug, name=s.name) for s in u_skills]

    # 3) Хакатон — ради registration_end_date
    hack = await hacks_repo.get_by_id(app_obj.hackathon_id)
    reg_end = hack.registration_end_date.isoformat() if (hack and hack.registration_end_date) else None

    # 4) Собираем карточку
    return ApplicationCardOut(
        id=app_obj.id,
        hackathon_id=app_obj.hackathon_id,
        user_id=app_obj.user_id,
        role=app_obj.role,
        username=usr.username,
        first_name=usr.first_name,
        last_name=usr.last_name,
        skills=skills_out,
        registration_end_date=reg_end,
    )


# ---- РОУТЫ: список по хакатону ----

@router.get("/hackathons/{hackathon_id}/applications", response_model=dict)
async def list_hackathon_applications(
    hackathon_id: int,
    role: Optional[RoleType] = Query(
        default=None,
        description="Фильтр по роли (Enum RoleType)",
    ),
    q: Optional[str] = Query(
        default=None,
        description="Поиск по username/first_name/last_name (без учёта регистра)",
    ),
    limit: int = Query(default=20, ge=1, le=100, description="Размер страницы"),
    offset: int = Query(default=0, ge=0, description="Смещение от начала списка"),
    _me: int = Depends(get_current_user_id),  # просто требуем авторизацию
):
    """
    Список анкет одного хакатона с фильтрами и пагинацией.
    """
    rows = await apps_repo.search(
        hackathon_id=hackathon_id,
        role=role.value if role else None,
        q=q,
        limit=limit,
        offset=offset,
    )

    items = [await _pack_application_card(r) for r in rows]

    return {
        "items": [i.model_dump() for i in items],
        "limit": limit,
        "offset": offset,
    }


# ---- РОУТЫ: моя анкета на хакатон ----

@router.get("/hackathons/{hackathon_id}/applications/me", response_model=ApplicationCardOut)
async def get_my_application_on_hackathon(
    hackathon_id: int,
    user_id: int = Depends(get_current_user_id),
):
    """
    Получить *мою* анкету на указанном хакатоне.
    """
    app = await apps_repo.get_by_user_and_hackathon(
        user_id=user_id,
        hackathon_id=hackathon_id,
    )
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    return await _pack_application_card(app)


@router.post(
    "/hackathons/{hackathon_id}/applications",
    response_model=ApplicationCardOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_my_application(
    hackathon_id: int,
    payload: ApplicationCreateIn,
    user_id: int = Depends(get_current_user_id),
):
    """
    Создать *мою* анкету на конкретный хакатон.

    Инвариант: на один (hackathon_id, user_id) может быть только одна анкета.
    """
    exists = await apps_repo.get_by_user_and_hackathon(
        user_id=user_id,
        hackathon_id=hackathon_id,
    )
    if exists:
        raise HTTPException(
            status_code=409,
            detail="application already exists for this hackathon",
        )

    app = await apps_repo.create(
        user_id=user_id,
        hackathon_id=hackathon_id,
        role=payload.role.value if payload.role else None,
        skills=None,  # навыки не храним в application, они подтягиваются из профиля
    )

    return await _pack_application_card(app)


# ---- РОУТЫ: мои анкеты по всем хакатонам ----

@router.get("/me/applications", response_model=dict)
async def list_my_applications(
    limit: int = Query(default=50, ge=1, le=100, description="Размер страницы"),
    offset: int = Query(default=0, ge=0, description="Смещение от начала списка"),
    user_id: int = Depends(get_current_user_id),
):
    """
    Список всех *моих* анкет по всем хакатонам (для личного кабинета).
    """
    rows = await apps_repo.search_by_user(
        user_id=user_id,
        limit=limit,
        offset=offset,
    )
    items = [await _pack_application_card(r) for r in rows]

    return {
        "items": [i.model_dump() for i in items],
        "limit": limit,
        "offset": offset,
    }


# ---- РОУТЫ: работа по application_id ----

@router.get("/applications/{application_id}", response_model=ApplicationCardOut)
async def get_application_by_id(
    application_id: int,
    _me: int = Depends(get_current_user_id),
):
    """
    Получить анкету по её id.

    Доступна любому авторизованному пользователю.
    """
    app = await apps_repo.get_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    return await _pack_application_card(app)


@router.patch("/applications/{application_id}", response_model=ApplicationCardOut)
async def patch_application_by_id(
    application_id: int,
    payload: ApplicationPatchIn,
    user_id: int = Depends(get_current_user_id),
):
    """
    Частично обновить анкету по id.

    Ограничение:
      • менять может только владелец анкеты (app.user_id == current user).
    """
    app = await apps_repo.get_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    if app.user_id != user_id:
        raise HTTPException(status_code=403, detail="forbidden: not an owner")

    data = payload.model_dump(exclude_unset=True)

    if "role" in data and data["role"] is not None:
        data["role"] = data["role"].value
    if "status" in data and data["status"] is not None:
        data["status"] = data["status"].value

    updated = await apps_repo.update(application_id, data)
    if not updated:
        # На случай, если кто-то удалил запись между SELECT и UPDATE
        raise HTTPException(status_code=404, detail="application not found (update)")

    return await _pack_application_card(updated)


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application_by_id(
    application_id: int,
    user_id: int = Depends(get_current_user_id),
):
    """
    Удалить анкету по id.

    Ограничение:
      • удалять может только владелец анкеты.
    """
    app = await apps_repo.get_by_id(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="application not found")

    if app.user_id != user_id:
        raise HTTPException(status_code=403, detail="forbidden: not an owner")

    ok = await apps_repo.delete(application_id)
    if not ok:
        # теоретически: уже удалили между проверкой и delete()
        raise HTTPException(status_code=404, detail="application not found (delete)")

    return Response(status_code=status.HTTP_204_NO_CONTENT)

