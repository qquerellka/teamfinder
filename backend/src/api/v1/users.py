from pydantic import BaseModel
from typing import List
from fastapi import HTTPException, APIRouter
from urllib.parse import urlparse, parse_qs
import json
from src.core.db import AsyncSessionLocal
from src.models.user import User
from src.repositories.users import upsert_from_tg_profile

router = APIRouter()

class UserUpdate(BaseModel):
    tg_link: str  # Ссылка на профиль Telegram
    bio: str
    age: int
    city: str
    university: str
    skills: List[str]  # Просто список строк
    link: str  # Прочая ссылка

import logging

# Для логирования
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Функция для парсинга ссылки на Telegram профиль
def parse_telegram_link(link: str):
    try:
        parsed_url = urlparse(link)
        query_params = parse_qs(parsed_url.query)

        # Логируем весь query-стринг
        logger.info(f"Query params: {query_params}")

        user_data = query_params.get('user', [None])[0]
        
        if user_data is None:
            raise HTTPException(status_code=400, detail="User data is missing in the link")
        
        # Логируем, что получаем из user
        logger.info(f"User data: {user_data}")

        # Парсим JSON строку с данными пользователя
        user = json.loads(user_data)

        # Логируем полученные данные пользователя
        logger.info(f"Parsed user: {user}")

        return user

    except Exception as e:
        logger.error(f"Error parsing the Telegram link: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error parsing Telegram data: {str(e)}")



# Использует PATCH метод для частичного обновления
@router.patch("/update")
# Принимает данные в формате UserUpdate
async def update_user_data(user_update: UserUpdate):
    try:
        # Парсим данные из tg_link
        user_data = parse_telegram_link(user_update.tg_link)

        tg_data = {
            'id': user_data['id'],
            'username': user_data.get('username', 'default_username'),  # Добавлен дефолтный username
            'name': user_data.get('name', 'default_name'),  # Добавлен дефолтный name
            'surname': user_data.get('surname', 'default_surname'),  # Добавлен дефолтный surname
            'avatar_url': user_data.get('avatar_url', None)
        }

        # Работаем с сессией базы данных
        async with AsyncSessionLocal() as session:
            try:
                user = await upsert_from_tg_profile(session, tg_data=tg_data)

                # Обновляем вручную введенные данные
                user.bio = user_update.bio
                user.age = user_update.age
                user.city = user_update.city
                user.university = user_update.university
                user.skills = user_update.skills
                user.link = user_update.link

                # Сохраняем изменения в БД
                await session.commit()  # После этого транзакция должна быть завершена

                # После коммита синхронизируем объект с БД
                await session.refresh(user)

                return {"message": "User updated successfully", "user": user}

            except Exception as e:
                await session.rollback()  # Откатываем транзакцию в случае ошибки
                raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")
    
    except Exception as e:
        # Если парсинг данных из ссылки не прошел, возвращаем ошибку
        raise HTTPException(status_code=400, detail=f"Error parsing Telegram data: {str(e)}")
