# =============================================================================
# ФАЙЛ: backend/repositories/applications.py
# КРАТКО: Репозиторий для работы с анкетами пользователей (Application).
# ЗАЧЕМ:
#   • Инкапсулирует доступ к БД: создание анкеты, поиск (с фильтрами), чтение по ключам,
#     обновление и удаление. Держит SQL-логику в одном месте, чтобы роутеры были «тонкими».
#   • Фильтры: роль (Enum) + q-поиск по username/first_name/last_name (через JOIN на users).
# ОСОБЕННОСТИ:
#   • Асинхронные сессии «per-operation» через BaseRepository._sm(): на каждую операцию
#     открывается краткоживущая async-сессия и закрывается по выходу из контекст-менеджера.
#   • Возвращает ORM-модели (Application). Формирование «карточки» (обогащение данными users/skills/hackathon)
#     происходит в роутере — так мы разводим слои ответственности.
# ИНВАРИАНТЫ И ОГРАНИЧЕНИЯ ДАННЫХ:
#   • В БД должна быть уникальность (hackathon_id, user_id) — одна анкета на хакатон на пользователя.
#   • ON DELETE CASCADE на FK (hackathon_id, user_id) гарантирует, что «сиротских» анкет не останется.
# ВОПРОСЫ ПРОИЗВОДИТЕЛЬНОСТИ:
#   • Поиск с q делает JOIN на users — нужен индекс по users(username, first_name, last_name) или отдельные индексы.
#   • Сортировка по application.updated_at — полезен индекс на этом поле (или составной на (hackathon_id, updated_at)).
# =============================================================================

from __future__ import annotations

from typing import Optional, List

from sqlalchemy import select, update, delete, func
from backend.repositories.base import BaseRepository

from backend.persistend.models import application as m_app
from backend.persistend.models import users as m_users


class ApplicationsRepo(BaseRepository):
    """
    Репозиторий для работы с таблицей `application`.
    Содержит минимально необходимый CRUD и поисковые методы.
    Каждая публичная функция открывает отдельную асинхронную сессию (per-operation).
    """

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, app_id: int) -> Optional[m_app.Application]:
        """
        Получить анкету по первичному ключу (id).

        ПРИМЕНЕНИЕ:
          • Быстрые точечные чтения (детальный просмотр после выбора в списке).
        ВОЗВРАЩАЕТ:
          • ORM-объект Application или None, если анкета отсутствует.
        """
        async with self._sm() as s:
            return await s.get(m_app.Application, app_id)

    async def get_by_user_and_hackathon(
        self, *, user_id: int, hackathon_id: int
    ) -> Optional[m_app.Application]:
        """
        Получить анкету конкретного пользователя на конкретном хакатоне.

        ПРИМЕНЕНИЕ:
          • Ручки вида: GET /hackathons/{hackathon_id}/applications/me
                        GET /hackathons/{hackathon_id}/applications/{user_id}
          • Проверка уникальности перед созданием (POST), чтобы не допустить дубль.
        ВОЗВРАЩАЕТ:
          • ORM-объект Application или None, если анкета не найдена.
        """
        A = m_app.Application
        async with self._sm() as s:
            stmt = (
                select(A)
                .where(A.user_id == user_id)
                .where(A.hackathon_id == hackathon_id)
                .limit(1)
            )
            res = await s.execute(stmt)
            return res.scalars().first()

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
          • q:    case-insensitive поиск по users.username/first_name/last_name (ILIKE/LOWER LIKE).

        ПАГИНАЦИЯ:
          • limit/offset — для постраничной выдачи.

        ВОЗВРАЩАЕТ:
          • Список ORM-объектов Application. Обогащение карточек выполняется выше по слою (в роутере).

        ЗАМЕТКИ:
          • JOIN на users нужен только для фильтра по q. Если q не передан, всё равно делаем JOIN — так проще,
            но при желании можно оптимизировать и делать JOIN только при наличии q.
          • Для q-поиска полезны индексы на users.username, users.first_name, users.last_name (btree или trigram).
        """
        A = m_app.Application
        U = m_users.User

        async with self._sm() as s:
            # Базовый набор: все анкеты одного хакатона, присоединяем users для опционального текстового фильтра
            stmt = (
                select(A)
                .join(U, U.id == A.user_id)
                .where(A.hackathon_id == hackathon_id)
            )

            # Фильтр по роли (если роль задана)
            if role:
                stmt = stmt.where(A.role == role)

            # Текстовый фильтр по username/first_name/last_name (без учёта регистра)
            if q:
                q_like = f"%{q}%"
                # username: приводим к lower и сравниваем с lower(q_like); coalesce для NULL -> ""
                username_ilike = func.lower(func.coalesce(U.username, "")).like(func.lower(q_like))
                # first_name/last_name: ILIKE (PostgreSQL), обрабатывает регистр самостоятельно
                fn_ilike = U.first_name.ilike(q_like)
                ln_ilike = U.last_name.ilike(q_like)
                stmt = stmt.where(username_ilike | fn_ilike | ln_ilike)

            # Стабильная сортировка «свежие выше»
            stmt = stmt.order_by(A.updated_at.desc()).limit(limit).offset(offset)

            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def search_by_user(self, *, user_id: int, limit: int, offset: int) -> List[m_app.Application]:
        """
        Список всех анкет конкретного пользователя по всем хакатонам (для /me/applications).

        ПАГИНАЦИЯ:
          • limit/offset.

        ВОЗВРАЩАЕТ:
          • Список ORM-объектов Application, отсортированный по updated_at DESC.

        ИНДЕКСЫ:
          • Рекомендуется индекс на application(user_id, updated_at) — ускорит WHERE и ORDER BY.
        """
        A = m_app.Application
        async with self._sm() as s:
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
        title: Optional[str],
        about: Optional[str],
        city: Optional[str],
        skills: Optional[list[str]],  # сейчас не сохраняем (MVP), поле для совместимости сигнатур
    ) -> m_app.Application:
        """
        Создать новую анкету.

        ПРЕДУСЛОВИЯ (желательно проверять выше по слою или полагаться на БД):
          • Не должно существовать другой записи с тем же (hackathon_id, user_id).
            Этому соответствует UNIQUE-ограничение в БД (app_unique_per_hack).
          • FK на users/hackathon должны существовать (иначе нарушится целостность).

        ПОВЕДЕНИЕ:
          • Заполняет минимально необходимые поля: user_id, hackathon_id, role.
          • Поля status/joined берутся по дефолтам из БД/модели.
          • Доп. поля (title/about/city) проставляются, только если есть в ORM-модели (hasattr).

        ВОЗВРАЩАЕТ:
          • ORM-объект Application с проставленным первичным ключом (после commit/refresh).
        """
        A = m_app.Application
        async with self._sm() as s:
            obj = A(
                user_id=user_id,
                hackathon_id=hackathon_id,
                role=role,  # Колонка Enum примет строку (SQLAlchemy приведёт)
                # status / joined — по дефолту
            )
            # Поля могут отсутствовать в модели — защищаемся через hasattr
            if hasattr(A, "title"):
                obj.title = title
            if hasattr(A, "about"):
                obj.about = about
            if hasattr(A, "city"):
                obj.city = city

            s.add(obj)
            # Возможные исключения:
            #  • IntegrityError при нарушении UNIQUE(hackathon_id,user_id) или FK — ловятся на уровне роутера/сервиса.
            await s.commit()
            await s.refresh(obj)  # Обновим объект, чтобы получить id/updated_at и т.п.
            return obj

    # ---------- ОБНОВЛЕНИЕ ----------

    async def update(self, app_id: int, data: dict) -> Optional[m_app.Application]:
        """
        Частичное обновление анкеты по id.

        ВХОД:
          • data — словарь изменяемых полей (например: {'role': 'Backend', 'status': 'hidden', ...}).
            Ответственность за валидацию значений — выше по слою (схемы Pydantic/сервис).
        ПОВЕДЕНИЕ:
          • Выполняется UPDATE с synchronize_session='fetch' (корректно синхронизирует ORM-сессию).
        ВОЗВРАЩАЕТ:
          • Обновлённый ORM-объект Application или None, если строка не найдена.
        """
        A = m_app.Application
        async with self._sm() as s:
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
          • Связанные сущности (инвайты/респонсы/мембершипы и т.п.) должны иметь корректные
            FK-стратегии (CASCADE/RESTRICT), чтобы не получить «висячие» ссылки.
        """
        A = m_app.Application
        async with self._sm() as s:
            stmt = delete(A).where(A.id == app_id)
            res = await s.execute(stmt)
            await s.commit()
            return res.rowcount > 0
