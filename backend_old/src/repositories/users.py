# Асинхронная сессия БД
from sqlalchemy.ext.asyncio import AsyncSession
# Конструктор для SQL запросов
from sqlalchemy.future import select
# Модель пользователя (SQLAlchemy)
from src.models.user import User
# Для возврата HTTP ошибок
from fastapi import HTTPException
# Для логирования операций
import logging

# Получаем логгер для текущего модуля
logger = logging.getLogger(__name__)

# Асинхронная функция для создания или обновления пользователя из Telegram данных
async def upsert_from_tg_profile(session: AsyncSession, tg_data: dict) -> User:
    tg_id = tg_data.get('id')
    username = tg_data.get('username')
    name = tg_data.get('name')
    surname = tg_data.get('surname')
    avatar_url = tg_data.get('avatar_url', None)

    # Проверяем, что обязательное поле telegram_id присутствует
    if not tg_id:
        raise HTTPException(status_code=400, detail="Telegram ID is required")

    # Логируем начало процесса upsert (update + insert)
    logger.info(f"Upsert process started for tg_id: {tg_id}")

    # Создаем SQL запрос для поиска пользователя по telegram_id
    stmt = select(User).filter(User.telegram_id == tg_id)
    # Выполняем запрос к БД
    result = await session.execute(stmt)
    # Получаем одного пользователя или None если пользователь не найден
    user = result.scalar_one_or_none()

    if user is None:
        # ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН - СОЗДАЕМ НОВОГО
        user = User(
            telegram_id=tg_id,
            username=username,
            name=name,
            surname=surname,
            avatar_url=avatar_url
        )
        # Логируем создание нового пользователя
        logger.info(f"New user object created: {user}")
    else:
        # ЕСЛИ ПОЛЬЗОВАТЕЛЬ НАЙДЕН - ОБНОВЛЯЕМ СУЩЕСТВУЮЩЕГО
        user.username = username
        user.name = name
        user.surname = surname
        user.avatar_url = avatar_url
        # Логируем обновление существующего пользователя
        logger.info(f"Existing user object updated: {user}")

    # НЕ делаем session.add() здесь - это сделает вызывающий код
    # НЕ управляем транзакциями - это ответственность вызывающего кода
    return user