# Добавление роута для обновления данных пользователя через PATCH

# Импортирует необходимые компоненты FastAPI: APIRouter - для создания группы маршрутов,
# HTTPException - для обработки ошибок HTTP, Depends - для системы зависимостей
from fastapi import APIRouter, HTTPException, Depends
# Импортирует Pydantic схему для валидации данных пользователя
from src.schemas.telegram_init import UserInitData
from sqlalchemy.ext.asyncio import AsyncSession
# Импортирует генератор сессий БД из конфигурации базы данных
from src.core.db import AsyncSessionLocal
# Импортирует функцию бизнес-логики для создания/обновления пользователя
from src.repositories.users import upsert_user

# Создает экземпляр роутера - это группа маршрутов, которая будет подключена к основному приложению
router = APIRouter()

# Декоратор для создания PATCH endpoint: 
# PATCH - HTTP метод для частичного обновления ресурса, "/users/" - URL путь для этого endpoint
@router.patch("/users/")
async def update_user(user_data: UserInitData, db: AsyncSession = Depends(AsyncSessionLocal)):
    # Вызывает функцию репозитория для создания/обновления пользователя в БД
    user = await upsert_user(user_data, db)
    # Проверяет результат и выбрасывает исключение если пользователь не был создан/найден
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Возвращает успешный ответ в формате JSON
    return {"message": "User data updated successfully", "user": user}
