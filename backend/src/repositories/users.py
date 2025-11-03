from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from src.models.user import User
from src.schemas import UserInitData
from fastapi import HTTPException

# Объявление асинхронной функции которая выполняет операцию "upsert" (update + insert)
async def upsert_user(user_data: UserInitData, db: AsyncSession):
    # Проверяем, существует ли пользователь
    # Создает SQL запрос для поиска пользователя по telegram_id, фильтр по telegram_id
    stmt = select(User).filter(User.telegram_id == user_data.telegram_id)
    # Выполняет асинхронно SQL запрос в базе данных.
    result = await db.execute(stmt)
    # возвращает один объект или None, если не найден
    user = result.scalar_one_or_none()

    # Если пользователь не найден, создаем нового
    if user is None:
        # Создает нового пользователя - преобразует данные из Pydantic схемы в SQLAlchemy модель.
        user = User(
            telegram_id=user_data.telegram_id,
            username=user_data.username,
            name=user_data.first_name,
            surname=user_data.last_name,
            language_code=user_data.language_code,
            avatar_url=user_data.avatar_url,
            bio=user_data.bio,
            age=user_data.age,
            city=user_data.city,
            university=user_data.university,
            link=user_data.link,
            skills=user_data.skills
        )
        # Добавляет нового пользователя в сессию БД.
        db.add(user)
        # Сохраняет изменения в базе данных (коммит транзакции).
        await db.commit()
        # Обновляет объект пользователя из БД, чтобы получить сгенерированные поля (например, id).
        await db.refresh(user)
    else:
        # Обновляем данные
        # or для обновления только если новое значение не None
        # Если user_data.username не None - использует его, иначе оставляет текущее значение
        user.username = user_data.username or user.username
        user.name = user_data.first_name or user.name
        user.surname = user_data.last_name or user.surname
        user.language_code = user_data.language_code or user.language_code
        user.avatar_url = user_data.avatar_url or user.avatar_url
        user.bio = user_data.bio or user.bio
        user.age = user_data.age or user.age
        user.city = user_data.city or user.city
        user.university = user_data.university or user.university
        user.link = user_data.link or user.link
        user.skills = user_data.skills or user.skills
        await db.commit()
        await db.refresh(user)

    return user
