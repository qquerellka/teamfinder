# conlist - валидатор для списков с ограничениями
from pydantic import BaseModel, conlist
# Optional - для необязательных полей
from typing import List, Optional
# Импорт исключений FastAPI для обработки HTTP ошибок.
from fastapi import HTTPException
# Импорт функций для парсинга URL: urlparse - разбирает URL на компоненты, parse_qs - парсит query-параметры
from urllib.parse import urlparse, parse_qs
import json
from src.core.db import AsyncSessionLocal
from src.models.user import User
from src.repositories.users import upsert_from_tg_profile

app = FastAPI()

class UserUpdate(BaseModel):
    tg_link: str  # Ссылка на профиль Telegram
    bio: str
    age: int
    city: str
    university: str
    skills: conlist(str, min_items=1)  # Валидация для списка с минимальным элементом
    link: str  # Прочая ссылка

# Функция для парсинга ссылки на Telegram профиль
def parse_telegram_link(link: str):
    parsed_url = urlparse(link)
    # Разбирает URL на компоненты
    query_params = parse_qs(parsed_url.query)

    user_data = query_params.get('user', [None])[0]
    if user_data is None:
        raise HTTPException(status_code=400, detail="User data is missing in the link")

    # Парсим JSON строку с данными пользователя
    user = json.loads(user_data)
    return user

# Использует PATCH метод для частичного обновления
@app.patch("/user/update")
# Принимает данные в формате UserUpdate
async def update_user_data(user_update: UserUpdate):
    try:
        # Парсим данные из ссылки tg_link
        user_data = parse_telegram_link(user_update.tg_link)

        tg_id = user_data['id']
        username = user_data.get('username')
        name = user_data.get('name')
        surname = user_data.get('surname')
        language_code = user_data.get('language_code')
        avatar_url = user_data.get('photo_url', None)

        # Используем одну сессию
        # Создание асинхронной сессии БД с использованием контекстного менеджера.
        async with AsyncSessionLocal() as session:
            # Вызываем upsert функцию для обновления или вставки данных пользователя
            # Использует await для асинхронного выполнения
            user = await upsert_from_tg_profile(
                session,
                tg_id=tg_id,
                username=username,
                name=name,
                surname=surname,
                language_code=language_code,
                avatar_url=avatar_url,
            )

            # Обновляем вручную введенные данные
            user.bio = user_update.bio
            user.age = user_update.age
            user.city = user_update.city
            user.university = user_update.university
            user.skills = user_update.skills
            user.link = user_update.link

            # Сохраняем изменения в БД
            session.add(user)
            await session.commit()

            # После коммита синхронизируем объект с БД
            await session.refresh(user)

        return {"message": "User updated successfully", "user": user}
    
    except Exception as e:
        # Логируем или отправляем ошибку
        # Возвращает HTTP 500 с описанием ошибки
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")
