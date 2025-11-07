# Этот файл реализует базовый репозиторий для работы с ORM-моделями в SQLAlchemy.
# Репозиторий инкапсулирует стандартные операции CRUD (создание, чтение, обновление, удаление) и может быть использован с любыми моделями.
# Он обеспечивает гибкость при работе с базой данных и упрощает повторное использование кода для различных моделей.

from typing import TypeVar, Generic, Optional, Sequence, Any  # Импорты для аннотаций типов (дженерики и типы)
from sqlalchemy import select  # Для выполнения SQL-запросов
from sqlalchemy.ext.asyncio import AsyncSession  # Для работы с асинхронной сессией SQLAlchemy

T = TypeVar("T")  # "дженерик-параметр": сюда подставится конкретная ORM-модель при наследовании

# Базовый репозиторий для работы с произвольной ORM-моделью (например, User, Skill)
class BaseRepository(Generic[T]):
    """
    Базовый класс репозитория для произвольной ORM-модели T.

    Использование:
        repo = BaseRepository[User](session, User)

    Обычно создаются подклассы:
        class UserRepository(BaseRepository[User]):
            def __init__(self, session: AsyncSession):
                super().__init__(session, User)
            # здесь пишем методы для доменной логики:
            # get_by_email, list_active, exists_by_username и т.д.
    """

    # Инициализация репозитория с сессией и моделью
    def __init__(self, session: AsyncSession, model: type[T]):
        self.session = session  # асинхронная сессия SQLAlchemy для выполнения запросов
        self.model = model      # ORM-модель (например, User, Skill)

    # -------------------------
    # READ (по первичному ключу)
    # -------------------------
    async def get(self, id: Any) -> Optional[T]:
        """
        Получить объект по первичному ключу.
        Вернёт объект модели или None (если не найдено).
        """
        return await self.session.get(self.model, id)  # Используется асинхронный метод get() SQLAlchemy

    # -------------------------
    # READ (список с пагинацией)
    # -------------------------
    async def list(self, limit: int = 100, offset: int = 0) -> Sequence[T]:
        """
        Получить список объектов с лимитом и смещением.
        В реальных задачах часто добавляется сортировка (order_by).
        """
        stmt = select(self.model).limit(limit).offset(offset)  # Формируем SQL-запрос с лимитом и смещением
        res = await self.session.execute(stmt)  # Выполняем запрос
        return res.scalars().all()  # Возвращаем результаты как список объектов

    # -------------------------
    # CREATE (добавление объекта)
    # -------------------------
    async def add(self, obj: T) -> T:
        """
        Добавить объект в сессию и сделать flush().
        flush отправляет INSERT в БД (без COMMIT), чтобы появились значения
        генерируемых полей (id, default-значения).
        """
        self.session.add(obj)  # Добавляем объект в сессию
        await self.session.flush()  # Выполняем flush для отправки данных в БД без коммита
        return obj  # Возвращаем добавленный объект

    # -------------------------
    # DELETE (удаление объекта)
    # -------------------------
    async def delete(self, obj: T) -> None:
        """
        Удалить объект (без COMMIT).
        """
        await self.session.delete(obj)  # Удаляем объект из сессии (без коммита)

    # -------------------------
    # (Полезные расширения — опционально)
    # -------------------------
    
    # Проверка существования объекта по первичному ключу (id)
    async def exists_by_id(self, id: Any) -> bool:
        """
        Быстрая проверка существования по PK (True/False).
        """
        return (await self.get(id)) is not None  # Возвращает True, если объект найден, иначе False

    # Универсальный метод для поиска одного объекта по фильтрам
    async def get_one_by(self, **filters) -> Optional[T]:
        """
        Универсальный поиск по набору равенств: repo.get_one_by(email="x@y", active=True)
        Вернёт один объект или None.
        """
        stmt = select(self.model).filter_by(**filters).limit(1)  # Формируем запрос с фильтрами
        res = await self.session.execute(stmt)  # Выполняем запрос
        return res.scalars().first()  # Возвращаем первый результат или None, если ничего не найдено

    # Универсальный метод для получения списка объектов по фильтрам с пагинацией
    async def list_by(self, limit: int = 100, offset: int = 0, **filters) -> Sequence[T]:
        """
        Универсальный список по равенствам с пагинацией: repo.list_by(active=True, limit=20)
        """
        stmt = select(self.model).filter_by(**filters).limit(limit).offset(offset)  # Формируем запрос с фильтрами
        res = await self.session.execute(stmt)  # Выполняем запрос
        return res.scalars().all()  # Возвращаем результаты как список объектов
