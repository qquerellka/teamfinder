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

router = APIRouter()

class UserUpdate(BaseModel):
    tg_link: str
    bio: str
    age: int
    city: str
    university: str
    skills: List[str]
    link: str

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def parse_telegram_link(tg_link: str):
    try:
        parsed_url = urlparse(tg_link)
        query_params = parse_qs(parsed_url.query)
        
        logger.info(f"Query params: {query_params}")

        user_data_str = query_params.get('user', [None])[0]
        
        if user_data_str is None:
            raise HTTPException(status_code=400, detail="User data is missing in the link")
        
        logger.info(f"User data (raw): {user_data_str}")

        user_data = json.loads(user_data_str)
        logger.info(f"Parsed user data: {user_data}")

        user_id = user_data.get('id')
        name = user_data.get('first_name')
        username = user_data.get('username')
        surname = user_data.get('last_name')
        avatar_url = user_data.get('avatar_url')
        if avatar_url == "":
            avatar_url = None

        if not user_id:
            raise HTTPException(status_code=400, detail="Telegram ID is required")

        logger.info(f"Parsed user: {name} (ID: {user_id})")

        return {
            'id': user_id,
            'username': username if username else 'default_username',
            'name': name if name else 'default_name',
            'surname': surname if surname else 'default_surname',
            'avatar_url': avatar_url
        }

    except Exception as e:
        logger.error(f"Error parsing Telegram data: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error parsing Telegram data: {str(e)}")

@router.patch("/update")
async def update_user_data(
    user_update: UserUpdate,
    session: AsyncSession = Depends(get_db)
):
    try:
        # Парсим данные из tg_link
        user_data = parse_telegram_link(user_update.tg_link)

        tg_data = {
            'id': user_data['id'],
            'username': user_data['username'],
            'name': user_data['name'],
            'surname': user_data['surname'],
            'avatar_url': user_data['avatar_url']
        }

        # ВАРИАНТ А: Используем ТОЛЬКО async with session.begin() - ОН САМ УПРАВЛЯЕТ ТРАНЗАКЦИЕЙ
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
            
            logger.info(f"All changes prepared for user: {user.id}")
            
            # НЕ делаем flush() и НЕ делаем commit() - async with session.begin() САМ сделает коммит при выходе

        # После выхода из async with session.begin() транзакция АВТОМАТИЧЕСКИ коммитится
        logger.info(f"Transaction automatically committed for user: {user.id}")
        
        # Возвращаем пользователя - данные уже сохранены в БД
        return {"message": "User updated successfully", "user": user}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/debug/check-db")
async def debug_check_db(session: AsyncSession = Depends(get_db)):
    """Отладочный эндпоинт для проверки данных в БД"""
    try:
        # Проверяем все записи в таблице users
        stmt = select(User)
        result = await session.execute(stmt)
        users = result.scalars().all()
        
        user_list = []
        for user in users:
            user_list.append({
                "id": user.id,
                "telegram_id": user.telegram_id,
                "name": user.name,
                "username": user.username,
                "surname": user.surname,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "age": user.age,
                "city": user.city,
                "university": user.university,
                "skills": user.skills,
                "link": user.link,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            })
        
        return {
            "total_users": len(users),
            "users": user_list
        }
        
    except Exception as e:
        return {"error": str(e)}

@router.get("/check/{telegram_id}")
async def check_user(telegram_id: int, session: AsyncSession = Depends(get_db)):
    """Проверка существования пользователя в БД"""
    stmt = select(User).where(User.telegram_id == telegram_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user:
        return {
            "exists": True,
            "user": {
                "id": user.id,
                "telegram_id": user.telegram_id,
                "name": user.name,
                "username": user.username,
                "surname": user.surname,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "age": user.age,
                "city": user.city,
                "university": user.university,
                "skills": user.skills,
                "link": user.link,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        }
    else:
        return {"exists": False}