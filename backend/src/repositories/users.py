from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models.user import User
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

async def upsert_from_tg_profile(session: AsyncSession, tg_data: dict) -> User:
    tg_id = tg_data.get('id')
    username = tg_data.get('username')
    name = tg_data.get('name')
    surname = tg_data.get('surname')
    avatar_url = tg_data.get('avatar_url', None)

    if not tg_id:
        raise HTTPException(status_code=400, detail="Telegram ID is required")

    # Логируем начало работы
    logger.info(f"Upsert process started for tg_id: {tg_id}")

    async with session.begin():  # Начинаем транзакцию внутри блока
        stmt = select(User).filter(User.telegram_id == tg_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            user = User(
                telegram_id=tg_id,
                username=username,
                name=name,
                surname=surname,
                avatar_url=avatar_url
            )
            session.add(user)  # Добавляем нового пользователя
            logger.info(f"New user created: {user}")
        else:
            user.username = username
            user.name = name
            user.surname = surname
            user.avatar_url = avatar_url
            logger.info(f"User found and updated: {user}")

    # Логируем перед коммитом
    logger.info(f"Attempting to commit changes for user: {user}")

    # После завершения транзакции сессия должна быть обновлена
    await session.refresh(user)  # Обновляем объект сессии

    # Логируем успешный коммит
    logger.info(f"Changes committed successfully for user: {user}")

    return user
