from pydantic import BaseModel
from typing import List
from fastapi import HTTPException, APIRouter, Depends
from src.core.db import get_db
from src.models.user import User
from src.repositories.users import upsert_from_tg_profile
import logging
import json
from urllib.parse import urlparse, parse_qs
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Создание роутера для группировки эндпоинтов связанных с пользователями
router = APIRouter()

# Модель данных для обновления пользователя - определяет структуру входящего JSON
class UserUpdate(BaseModel):
    tg_link: str
    bio: str
    age: int
    city: str
    university: str
    skills: List[str]
    link: str

# Настраиваем систему логирования для отслеживвания работы приложения
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def parse_telegram_link(tg_link: str):
    try:
        parsed_url = urlparse(tg_link)
        # Извлекаем параметры из query string URL
        query_params = parse_qs(parsed_url.query)
        
        # Логируем параметры для отладки
        logger.info(f"Query params: {query_params}")

        # Извлекаем закодированные данные пользователя из параметра 'user'
        user_data_str = query_params.get('user', [None])[0]
        
        if user_data_str is None:
            raise HTTPException(status_code=400, detail="User data is missing in the link")
        
        # Логируем сырые данные пользователя
        logger.info(f"User data (raw): {user_data_str}")
        # Декодируем JSON строку в словарь Python
        user_data = json.loads(user_data_str)
        # Логируем распарсенные данные 
        logger.info(f"Parsed user data: {user_data}")

        user_id = user_data.get('id')
        name = user_data.get('first_name')
        username = user_data.get('username')
        surname = user_data.get('last_name')
        avatar_url = user_data.get('avatar_url')

        if not user_id:
            raise HTTPException(status_code=400, detail="Telegram ID is required")

        # Логируем успешное извлечение данных
        logger.info(f"Parsed user: {name} (ID: {user_id})")

        return {
            'id': user_id,
            'username': username,
            'name': name,
            'surname': surname,
            'avatar_url': avatar_url
        }

    except Exception as e:
        # Логируем и возвращаем ошибку парсинга
        logger.error(f"Error parsing Telegram data: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error parsing Telegram data: {str(e)}")

# Основной эндпоинт для обновления данных пользователя
@router.patch("/update")
async def update_user_data(
    # Данные из тела запроса
    user_update: UserUpdate,
    # Сессия БД из dependency injection
    session: AsyncSession = Depends(get_db)
):
    try:
        # Парсим данные из tg_link
        user_data = parse_telegram_link(user_update.tg_link)
        # Формируем словарь с Telegram данными для обновления
        tg_data = {
            'id': user_data['id'],
            'username': user_data['username'],
            'name': user_data['name'],
            'surname': user_data['surname'],
            'avatar_url': user_data['avatar_url']
        }

        # Используем ТОЛЬКО async with session.begin() - ОН САМ УПРАВЛЯЕТ ТРАНЗАКЦИЕЙ
        async with session.begin():
            # Обновляем или вставляем данные пользователя
            user = await upsert_from_tg_profile(session, tg_data=tg_data)

            # Обновляем вручную введенные данные
            user.bio = user_update.bio
            user.age = user_update.age
            user.city = user_update.city
            user.university = user_update.university
            user.skills = user_update.skills
            user.link = user_update.link

            # Добавляем пользователя в сессию (особенно важно для новых пользователей)
            session.add(user)
            # Логируем подготовку изменений
            logger.info(f"All changes prepared for user: {user.id}")

        # После выхода из async with session.begin() транзакция АВТОМАТИЧЕСКИ коммитится
        # Логируем успешное сохранение
        logger.info(f"Transaction automatically committed for user: {user.id}")
        
        # Возвращаем пользователя - данные уже сохранены в БД
        return {"message": "User updated successfully", "user": user}
    
    except HTTPException:
        # Пробрасываем HTTP ошибки без изменений
        raise
    except Exception as e:
        # Логируем и возвращаем непредвиденные ошибки
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")