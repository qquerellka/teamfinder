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

    logger.info(f"Upsert process started for tg_id: {tg_id}")

    # ПРОСТОЙ SELECT без управления транзакциями
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
        logger.info(f"New user will be created: {user}")
    else:
        user.username = username
        user.name = name
        user.surname = surname
        user.avatar_url = avatar_url
        logger.info(f"Existing user will be updated: {user}")

    return user