from pydantic import BaseModel
from typing import List
from fastapi import HTTPException, APIRouter
from telegram_init_data import TelegramInitDataAuth
from src.core.db import AsyncSessionLocal  # Импортируем сессию
from src.models.user import User
from src.repositories.users import upsert_from_tg_profile
import logging
import json
from urllib.parse import urlparse, parse_qs

router = APIRouter()

# Модель данных для обновления пользователя
class UserUpdate(BaseModel):
    tg_link: str  # Ссылка на профиль Telegram
    bio: str
    age: int
    city: str
    university: str
    skills: List[str]  # Список навыков
    link: str  # Прочая ссылка

# Для логирования
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Функция для парсинга и валидации ссылки Telegram
def parse_telegram_link(tg_link: str):
    try:
        # Разбираем параметры из tg_link
        parsed_url = urlparse(tg_link)
        query_params = parse_qs(parsed_url.query)
        
        # Логируем все параметры
        logger.info(f"Query params: {query_params}")

        # Извлекаем параметр 'user'
        user_data_str = query_params.get('user', [None])[0]
        
        if user_data_str is None:
            raise HTTPException(status_code=400, detail="User data is missing in the link")
        
        # Логируем, что получаем из user
        logger.info(f"User data (raw): {user_data_str}")

        # Декодируем строку JSON
        user_data = json.loads(user_data_str)

        # Логируем полученные данные пользователя
        logger.info(f"Parsed user data: {user_data}")

        # Извлекаем необходимые данные
        user_id = user_data.get('id')
        name = user_data.get('first_name')  # Используем 'first_name' для 'name' в БД
        username = user_data.get('username')
        surname = user_data.get('last_name')
        avatar_url = user_data.get('avatar_url', None)  # если есть

        if not user_id:
            raise HTTPException(status_code=400, detail="Telegram ID is required")

        # Логируем, что получаем
        logger.info(f"Parsed user: {name} (ID: {user_id})")

        # Возвращаем извлеченные данные
        return {
            'id': user_id,
            'username': username if username else 'default_username',
            'name': name if name else 'default_name',  # Используем name для базы данных
            'surname': surname if surname else 'default_surname',
            'avatar_url': avatar_url
        }

    except Exception as e:
        logger.error(f"Error parsing Telegram data: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error parsing Telegram data: {str(e)}")


# Использует PATCH метод для частичного обновления данных пользователя
@router.patch("/update")
async def update_user_data(user_update: UserUpdate):
    try:
        # Парсим данные из tg_link с использованием функции parse_telegram_link
        user_data = parse_telegram_link(user_update.tg_link)

        tg_data = {
            'id': user_data['id'],
            'username': user_data['username'],
            'name': user_data['name'],  # Используем name для базы данных
            'surname': user_data['surname'],
            'avatar_url': user_data['avatar_url']
        }

        # Работаем с сессией базы данных
        async with AsyncSessionLocal() as session:  # Создаем сессию для работы с БД
            try:
                # Обновляем или вставляем данные пользователя
                user = await upsert_from_tg_profile(session, tg_data=tg_data)

                # Обновляем вручную введенные данные
                user.bio = user_update.bio
                user.age = user_update.age
                user.city = user_update.city
                user.university = user_update.university
                user.skills = user_update.skills
                user.link = user_update.link

                # Логируем перед коммитом
                logger.info(f"Attempting to commit changes for user: {user}")

                # Сохраняем изменения в БД
                await session.commit()  # Завершаем транзакцию с commit
                await session.refresh(user)  # Обновляем объект сессии после коммита

                # Логируем успешный коммит
                logger.info(f"Changes committed successfully for user: {user}")

                return {"message": "User updated successfully", "user": user}

            except Exception as e:
                # В случае ошибки откатываем изменения
                logger.error(f"Error updating user: {str(e)}")
                await session.rollback()  # Откат транзакции в случае ошибки
                raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")
    
    except Exception as e:
        # Если парсинг данных из ссылки не прошел, возвращаем ошибку
        logger.error(f"Error parsing Telegram data: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error parsing Telegram data: {str(e)}")
