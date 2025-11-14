# =============================================================================
# ФАЙЛ: backend/repositories/applications.py
# КРАТКО: Репозиторий для работы с анкетами пользователей (Application).
# ЗАЧЕМ:
#   • Инкапсулирует доступ к БД: создание анкеты, поиск (с фильтрами), чтение по ключам,
#     обновление и удаление. Держит SQL-логику в одном месте, чтобы роутеры были «тонкими».
#   • Фильтры: роль (Enum) + q-поиск по username/first_name/last_name (через JOIN на users).
# ОСОБЕННОСТИ:
#   • Асинхронные сессии «per-operation» через BaseRepository._sm():
#     на каждую операцию открывается отдельная async-сессия и закрывается по выходу
#     из контекст-менеджера.
#   • Возвращает ORM-модели (Application). Формирование «карточки» (обогащение данными
#     users/skills/hackathon) происходит в роутере — так мы разводим слои ответственности.
# ИНВАРИАНТЫ И ОГРАНИЧЕНИЯ ДАННЫХ:
#   • В БД должна быть уникальность (hackathon_id, user_id) — одна анкета на хакатон на пользователя.
#   • ON DELETE CASCADE на FK (hackathon_id, user_id) гарантирует, что «сиротских» анкет не останется.
# ПРОИЗВОДИТЕЛЬНОСТЬ:
#   • Поиск с q делает JOIN на users — нужны индексы по username/first_name/last_name.
#   • Сортировка по application.updated_at — полезен индекс на этом поле
#     (или составной (hackathon_id, updated_at)).
# =============================================================================

from __future__ import annotations # Для отложенной оценки аннотаций типов (удобно с ORM-моделями)

from typing import Optional, List  # Базовые типы для аннотаций

from sqlalchemy import select, update, delete, func  # Конструкторы SQL-запросов
from backend.repositories.base import BaseRepository # Репозитории наследуются от BaseRepository, обеспечивающего работу с сессиями

# ORM-модели
from backend.persistend.models import application as m_app
from backend.persistend.models import users as m_users


class ApplicationsRepo(BaseRepository):
    """
    Репозиторий для работы с таблицей `application`.

    Содержит минимально необходимый CRUD и поисковые методы.
    Каждая публичная функция открывает отдельную асинхронную сессию (per-operation)
    через self._sm() из BaseRepository.
    """

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, app_id: int) -> Optional[m_app.Application]:
        """
        Получить анкету по первичному ключу (id).

        ПРИМЕНЕНИЕ:
          • Быстрые точечные чтения (детальный просмотр, когда уже знаем id).
        ВОЗВРАЩАЕТ:
          • ORM-объект Application или None, если анкета отсутствует.
        """
        async with self._sm() as s: # Открываем async-сессию на время операции
            # s.get(Model, pk) — удобный способ достать запись по PK
            return await s.get(m_app.Application, app_id)

    async def get_by_user_and_hackathon(
        self, *, user_id: int, hackathon_id: int
    ) -> Optional[m_app.Application]:
        """
        Получить анкету конкретного пользователя на конкретном хакатоне.

        ПРИМЕНЕНИЕ:
          • GET /hackathons/{hackathon_id}/applications/me
          • GET /hackathons/{hackathon_id}/applications/{user_id}
          • Проверка перед созданием (POST), чтобы не допустить дубль.

        ВОЗВРАЩАЕТ:
          • ORM-объект Application или None, если анкета не найдена.
        """
        # A ссылается на тот же объект, что и m_app.Application
        A = m_app.Application # Локальный алиас для удобства
        async with self._sm() as s:
            # Собираем SELECT application.
            # * WHERE user_id = :user_id AND hackathon_id = :hackathon_id LIMIT 1
            stmt = (
                select(A)
                .where(A.user_id == user_id)
                .where(A.hackathon_id == hackathon_id)
                .limit(1)
            )
            res = await s.execute(stmt)  # Выполняем запро
            return res.scalars().first() # Берём первую найденную Application или None

    async def search(
        self,
        *,
        hackathon_id: int,
        role: Optional[str],
        q: Optional[str],
        limit: int,
        offset: int,
    ) -> List[m_app.Application]:
        """
        Список анкет одного хакатона с фильтрами и пагинацией.

        ФИЛЬТРЫ:
          • role: точное совпадение по роли (Enum в БД; SQLAlchemy корректно сравнивает со строкой).
          • q:    поиск без учёта регистра по users.username/first_name/last_name.

        ПАГИНАЦИЯ:
          • limit/offset — для постраничной выдачи.

        ВОЗВРАЩАЕТ:
          • Список ORM-объектов Application (без joinload'ов и т.п.).
            Обогащение карточек выполняется выше по слою (в роутере/сервисе).

        ЗАМЕТКИ:
          • JOIN на users нужен для q-поиска, но ради простоты делаем его всегда.
            Можно оптимизировать и делать JOIN только при наличии q.
        """
        A = m_app.Application
        U = m_users.User

        async with self._sm() as s:
            # Базовый запрос:
            #   SELECT application.*
            #   FROM application
            #   JOIN users ON users.id = application.user_id
            #   WHERE application.hackathon_id = :hackathon_id
            stmt = (
                select(A)
                .join(U, U.id == A.user_id)
                .where(A.hackathon_id == hackathon_id)
            )

            # ------ Фильтр по роли ------
            if role:
                # A.role — колонка Enum, но сравнение со строкой (например "Backend") валидно:
                # SQLAlchemy сам приведёт к правильному виду для Enum-типа.
                stmt = stmt.where(A.role == role)

            # ------ Текстовый фильтр по username/first_name/last_name ------
            if q:
                q_like = f"%{q}%"
                # username: приводим к lower и сравниваем с lower(q_like); coalesce для NULL -> ""
                username_ilike = func.lower(func.coalesce(U.username, "")).like(func.lower(q_like))
                # first_name/last_name: ILIKE (PostgreSQL), обрабатывает регистр самостоятельно
                fn_ilike = U.first_name.ilike(q_like)
                ln_ilike = U.last_name.ilike(q_like)
                # WHERE (lower(coalesce(username,'')) LIKE lower(:q_like)
                #        OR first_name ILIKE :q_like
                #        OR last_name ILIKE :q_like)
                stmt = stmt.where(username_ilike | fn_ilike | ln_ilike)

            # ------ Сортировка + пагинация ------
            # «Свежие анкеты» наверху
            stmt = stmt.order_by(A.updated_at.desc()).limit(limit).offset(offset)

            # Выполняем запрос и достаём список Application
            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def search_by_user(self, *, user_id: int, limit: int, offset: int) -> List[m_app.Application]:
        """
        Список всех анкет конкретного пользователя по всем хакатонам (для /me/applications).

        ПАГИНАЦИЯ:
          • limit/offset.

        ВОЗВРАЩАЕТ:
          • Список ORM-объектов Application, отсортированный по updated_at DESC.
        """
        A = m_app.Application

        async with self._sm() as s:
            # SELECT application.*
            # FROM application
            # WHERE user_id = :user_id
            # ORDER BY updated_at DESC
            # LIMIT :limit OFFSET :offset
            stmt = (
                select(A)
                .where(A.user_id == user_id)
                .order_by(A.updated_at.desc())
                .limit(limit)
                .offset(offset)
            )
            res = await s.execute(stmt)
            return list(res.scalars().all())

    # ---------- ЗАПИСЬ ----------

    async def create(
        self,
        *,
        user_id: int,
        hackathon_id: int,
        role: Optional[str],
        skills: Optional[list[str]],  # сейчас не сохраняем (MVP), поле для совместимости сигнатур
    ) -> m_app.Application:
        """
        Создать новую анкету.

        ПРЕДУСЛОВИЯ (желательно проверять выше по слою или полагаться на БД):
          • Не должно существовать другой записи с тем же (hackathon_id, user_id).
            Это гарантируется UNIQUE-ограничением app_unique_per_hack в БД.
          • users.id и hackathon.id должны существовать (иначе будет ошибка FK).

        ПОВЕДЕНИЕ:
          • Заполняет минимально необходимые поля: user_id, hackathon_id, role.
          • Статус и joined берутся по умолчанию из модели/БД.

        ВОЗВРАЩАЕТ:
          • ORM-объект Application с проставленным id и таймстемпами (после commit/refresh).
        """
        A = m_app.Application

        async with self._sm() as s:
            # Создаём объект ORM (но ещё не в БД, пока не commit)
            obj = A(
                user_id=user_id,
                hackathon_id=hackathon_id,
                role=role,  # Колонка Enum примет строку (SQLAlchemy приведёт)
                # status / joined — по дефолту
            )

            s.add(obj) # Помечаем объект для вставки

            # Возможные исключения:
            #   • IntegrityError из-за UNIQUE(hackathon_id,user_id) или нарушенного FK
            #   • Ловить/оборачивать их имеет смысл на уровне роутера/сервиса
            await s.commit()      # Фактически выполняем INSERT
            await s.refresh(obj)  # Обновляем объект из БД (подтягиваем id, created_at, updated_at и т.п.)
            return obj

    # ---------- ОБНОВЛЕНИЕ ----------

    async def update(self, app_id: int, data: dict) -> Optional[m_app.Application]:
        """
        Частичное обновление анкеты по id.

        ВХОД:
          • app_id — первичный ключ анкеты.
          • data — словарь изменяемых полей (например: {'role': 'Backend', 'status': 'hidden'}).
            Валидация/нормализация значений — на уровне схем Pydantic/сервиса.

        ПОВЕДЕНИЕ:
          • Выполняет UPDATE с execution_options(synchronize_session="fetch"), чтобы сессия
            корректно синхронизировалась с изменениями в БД.

        ВОЗВРАЩАЕТ:
          • Обновлённый ORM-объект Application или None, если запись не найдена.
        """
        A = m_app.Application

        async with self._sm() as s:
            # UPDATE application SET ... WHERE id = :app_id
            stmt = (
                update(A)
                .where(A.id == app_id)
                .values(**data)
                .execution_options(synchronize_session="fetch")
            )
            res = await s.execute(stmt)
            await s.commit()

            if res.rowcount == 0:
                # Никто не обновлён — вероятно, несуществующий id
                return None

            # Дочитываем актуальное состояние
            return await s.get(A, app_id)

    # ---------- УДАЛЕНИЕ ----------

    async def delete(self, app_id: int) -> bool:
        """
        Удалить анкету по id.

        ВОЗВРАЩАЕТ:
          • True — если удалили ≥ 1 строки.
          • False — если запись с таким id не найдена.

        ЗАМЕТКИ:
          • Связанные сущности (инвайты/респонсы/мембершипы и т.п.)
            должны иметь корректные FK-стратегии (CASCADE/RESTRICT),
            чтобы не получить «висячие» ссылки.
        """
        A = m_app.Application

        async with self._sm() as s:
            # DELETE FROM application WHERE id = :app_id
            stmt = delete(A).where(A.id == app_id)
            res = await s.execute(stmt)
            await s.commit()
            # rowcount > 0 — значит, что-то реально удалили
            return res.rowcount > 0
