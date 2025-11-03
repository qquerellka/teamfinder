# Импортирует Pydantic схему UserInitData из модуля schemas
from src.schemas import UserInitData
# Импортируем функцию, которая отвечает за сохранение данных пользователя в базу данных
from src.repositories.users import save_user_data
# Импортирует асинхронную сессию SQLAlchemy для работы с базой данных в асинхронном режиме
from sqlalchemy.ext.asyncio import AsyncSession
# Импортирует асинхронный генератор сессий (или пул соединений) для работы с БД
from src.core.db import AsyncSessionLocal

# функция принимает валидированные данные пользователя, асинхронную сессию БД
async def handle_init_data(user_data: UserInitData, db: AsyncSession):
    # Функция для сохранения данных пользователя
    # await - ожидает завершения асинхронной операции
    # save_user_data(user_data, db) - передает данные пользователя и сессию в репозиторий
    user = await save_user_data(user_data, db)
    return user
