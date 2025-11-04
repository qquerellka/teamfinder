from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models.user import User

async def upsert_from_tg_profile(session: AsyncSession, tg_data: dict) -> User:
    
    # Функция для обновления или вставки данных пользователя в БД
    # на основе данных, полученных с Telegram.

    # :param session: Сессия базы данных
    # :param tg_data: Данные пользователя с Telegram
    # :return: Обновленный или вставленный пользователь
    
    tg_id = tg_data.get('id')
    username = tg_data.get('username')
    name = tg_data.get('name')
    surname = tg_data.get('surname')
    avatar_url = tg_data.get('avatar_url', None)

    # Если telegram_id не найден в данных, то выбрасываем ошибку
    if not tg_id:
        raise HTTPException(status_code=400, detail="Telegram ID is required")

    # Используем переданную сессию (не создаём новую)
    async with session.begin():  # используем существующую сессию для транзакции
        # Ищем пользователя по telegram_id
        stmt = select(User).filter(User.telegram_id == tg_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        # Если пользователь не найден, создаем нового
        if user is None:
            user = User(
                telegram_id=tg_id,
                username=username,
                name=name,
                surname=surname,
                avatar_url=avatar_url
            )
            session.add(user)
            await session.commit()  # сохраняем пользователя
            await session.refresh(user)  # обновляем объект с новым id
        else:
            # Если пользователь найден, обновляем данные
            user.username = username
            user.name = name
            user.surname = surname
            user.avatar_url = avatar_url
            await session.commit()  # сохраняем изменения
            await session.refresh(user)  # обновляем объект

    return user
