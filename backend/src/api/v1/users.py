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
        avatar_url = user_data.get('avatar_url', None)

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

        # НАЧИНАЕМ ТРАНЗАКЦИЮ ВРУЧНУЮ
        async with session.begin():
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

                # ЯВНО ДОБАВЛЯЕМ user в сессию (на случай если это новый пользователь)
                session.add(user)
                
                # FLUSH вместо COMMIT - отправляем изменения в БД но не коммитим
                await session.flush()
                
                # REFRESH чтобы получить актуальные данные из БД
                await session.refresh(user)
                
                logger.info(f"User successfully updated in transaction: {user.id}")
                
                # Транзакция автоматически коммитится при выходе из блока async with
                
            except Exception as e:
                logger.error(f"Error in transaction: {str(e)}", exc_info=True)
                # Транзакция автоматически откатится при исключении
                raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

        # После выхода из блока async with транзакция уже закоммичена
        return {"message": "User updated successfully", "user": user}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")