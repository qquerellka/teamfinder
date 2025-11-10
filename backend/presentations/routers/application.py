# =============================================================================
# ФАЙЛ: backend/presentations/routers/applications.py
# КРАТКО: роутер FastAPI для работы с анкетами пользователей на хакатоны.
# ЗАЧЕМ:
#   • Создание анкеты для хакатона (POST /applications).
#   • Получение списка анкет для хакатона (GET /applications).
#   • Просмотр конкретной анкеты по ID (GET /applications/{app_id}).
#   • Обновление анкеты пользователя (PATCH /applications/{app_id}).
# ОСОБЕННОСТИ:
#   • Используем сервисный слой `ApplicationsService` для бизнес-логики.
#   • В ответах используются Pydantic-модели для анкет (ApplicationOut), которые удобно документируются в OpenAPI.
#   • Реализуем проверку прав доступа с помощью токена (JWT) через зависимость `get_current_user_id`.
# ВАЖНЫЕ МИКРО-ПРАВКИ:
#   • У каждого пользователя может быть только одна анкета на хакатон.
#   • Анкеты пользователей могут изменять статус с "published" на "hidden", когда они вступают в команду.
#   • Модели данных анкеты обновляются через POST, GET и PATCH запросы.
# =============================================================================

from fastapi import APIRouter, Depends, HTTPException
from backend.services.applications import ApplicationsService
# from backend.presentations.schemas.applications import ApplicationCreate, ApplicationUpdate, ApplicationOut !!!!!!!
# from backend.presentations.deps import get_current_user_id  !!!!!!!

# Роутер с префиксом /applications и тегом для OpenAPI документации
router = APIRouter(prefix="/applications", tags=["applications"])

# Инициализируем сервис для работы с анкетами
svc = ApplicationsService()

# ---- РОУТЫ ----

# Создание анкеты для хакатона
@router.post("", response_model=ApplicationOut)
async def create_application(body: ApplicationCreate, user_id: int = Depends(get_current_user_id)):
    """
    Создаёт анкету для хакатона. Пользователь может выбрать роль на хакатон,
    добавить описание, город и другие детали. Анкета будет сохранена в статусе 'published'.
    
    Параметры:
      body: ApplicationCreate — данные анкеты, такие как role, title, about, city и т.д.
      user_id: int — ID пользователя, получаем из JWT токена через get_current_user_id.
    
    Возвращает:
      ApplicationOut — модель анкеты, которая возвращается в ответе.
    """
    # Создание анкеты с переданными данными и текущим user_id
    app = await svc.create(user_id, body.hackathon_id, body.role, body.title, body.about, body.city, body.skills)
    return app

# Получение списка анкет для хакатона
@router.get("", response_model=list[ApplicationOut])
async def list_applications(
    hackathon_id: int, 
    role: str = None, 
    skills_any: list[str] = None, 
    q: str = None, 
    limit: int = 50, 
    offset: int = 0
):
    """
    Получает список анкет для конкретного хакатона, с возможностью фильтрации по роли,
    навыкам и текстовому запросу.
    
    Параметры:
      hackathon_id: int — ID хакатона.
      role: str (опционально) — роль пользователя на хакатоне.
      skills_any: list[str] (опционально) — список навыков, которые должны быть у пользователя.
      q: str (опционально) — текстовый запрос для поиска по анкете.
      limit: int — максимальное количество анкет для возврата (по умолчанию 50).
      offset: int — смещение для пагинации.
    
    Возвращает:
      list[ApplicationOut] — список анкет с указанными фильтрами.
    """
    return await svc.search(hackathon_id, role, skills_any, q, limit, offset)

# Получение анкеты по ID
@router.get("/{app_id}", response_model=ApplicationOut)
async def get_application(app_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Получение анкеты по ID. В ответе возвращаются все данные анкеты, включая роль, статус и информацию о хакатоне.
    
    Параметры:
      app_id: int — ID анкеты.
      user_id: int — ID текущего пользователя, передаётся через JWT.
    
    Возвращает:
      ApplicationOut — данные анкеты с информацией о пользователе и хакатоне.
    """
    app = await svc.get(app_id)
    if not app:
        raise HTTPException(404, detail="Application not found")
    return app

# Обновление анкеты пользователя
@router.patch("/{app_id}", response_model=ApplicationOut)
async def update_application(app_id: int, body: ApplicationUpdate, user_id: int = Depends(get_current_user_id)):
    """
    Частичное обновление анкеты. Пользователь может обновить роль, описание и другие поля анкеты.
    
    Параметры:
      app_id: int — ID анкеты.
      body: ApplicationUpdate — данные для обновления анкеты.
      user_id: int — ID пользователя, получаем из JWT токена через get_current_user_id.
    
    Возвращает:
      ApplicationOut — обновлённая анкета.
    """
    app = await svc.update(app_id, body.dict(exclude_unset=True))
    if not app:
        raise HTTPException(404, detail="Application not found")
    return app
