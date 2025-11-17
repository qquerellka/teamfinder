# =============================================================================
# ФАЙЛ: backend/repositories/users.py
# КРАТКО: Репозиторий для работы с пользователями и их навыками.
# ЗАЧЕМ:
#   • Инкапсулирует логику взаимодействия с базой данных для пользователей.
#   • Реализует методы для получения/обновления информации о пользователях и их навыках.
#   • Обеспечивает бизнес-логику для поиска пользователей по тексту и навыкам.
#   • Использует SQLAlchemy для взаимодействия с базой данных.
# =============================================================================

from __future__ import annotations  # Для отложенной оценки аннотаций типов (удобно с ORM-моделями)

from typing import Optional, Sequence, Iterable, List, Tuple  # Аннотации типов для разных коллекций

from sqlalchemy import select, func, literal, delete, insert  # SQLAlchemy: select-запросы, функции агрегатов, insert, delete
# Репозитории наследуются от BaseRepository, обеспечивающего работу с сессиями.
from backend.repositories.base import BaseRepository
# Импорты ORM-моделей для пользователей, навыков и связующей таблицы user_skill
from backend.persistend.models import users as m_users
from backend.persistend.models import skill as m_skill
from backend.persistend.models import user_skill as m_us
from backend.persistend.models import achievement as m_ach



class UsersRepo(BaseRepository):
    """Репозиторий для работы с пользователями и их навыками. Сессии создаются per-operation."""

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, user_id: int) -> Optional[m_users.User]:
        """
        Получение пользователя по его идентификатору (user_id).
        Используется метод get, который выполняет запрос по первичному ключу (PK).
        """
        async with self._sm() as s:  # Открытие сессии на время операции
            return await s.get(m_users.User, user_id)  # Получаем пользователя по первичному ключу

    async def get_by_telegram_id(self, tg_id: int) -> Optional[m_users.User]:
        """
        Получение пользователя по его Telegram ID (telegram_id).
        Запрос ограничен одним результатом.
        """
        async with self._sm() as s:
            res = await s.execute(
                select(m_users.User).where(m_users.User.telegram_id == tg_id).limit(1)  # SQL запрос
            )
            return res.scalars().first()  # Возвращаем первый найденный результат или None

    async def get_user_skills(self, user_id: int) -> List[m_skill.Skill]:
        """
        Получение списка навыков пользователя по его user_id, отсортированных по имени (skill.name).
        Используется соединение между таблицами через M2M-связь.
        """
        async with self._sm() as s:
            stmt = (
                select(m_skill.Skill)
                .join(m_us.user_skill, m_us.user_skill.c.skill_id == m_skill.Skill.id)  # JOIN с user_skill
                .where(m_us.user_skill.c.user_id == user_id)  # WHERE user_id = :user_id
                .order_by(m_skill.Skill.name.asc())  # Сортировка по имени навыка
            )
            res = await s.execute(stmt)  # Выполнение запроса
            return list(res.scalars().all())  # Возвращаем все найденные навыки в виде списка

    async def get_user_achievements(self, user_id: int) -> List[m_ach.Achievement]:
        """
        Вернёт список достижений пользователя, отсортированный по времени создания (новые сверху).
        """
        async with self._sm() as s:
            stmt = (
                select(m_ach.Achievement)
                .where(m_ach.Achievement.user_id == user_id)
                .order_by(m_ach.Achievement.created_at.desc())
            )
            res = await s.execute(stmt)
            return list(res.scalars().all())
    
    # ---------- ЗАПИСЬ ----------

    async def upsert_from_tg(self, profile: dict) -> m_users.User:
        """
        Создаёт или обновляет пользователя на основе данных из Telegram.
        Если пользователь найден по telegram_id — обновляем его данные, иначе создаём нового.
        """
        tg_id = int(profile["id"])  # Извлекаем Telegram ID из профиля
        # Извлекаем дополнительные данные из профиля Telegram (необязательные поля)
        username = profile.get("username")
        first_name = profile.get("first_name")
        last_name = profile.get("last_name")
        language_code = profile.get("language_code")
        avatar_url = profile.get("photo_url")

        async with self._sm() as s:
            res = await s.execute(
                select(m_users.User).where(m_users.User.telegram_id == tg_id).limit(1)  # Запрос для поиска по tg_id
            )
            user = res.scalars().first()  # Если пользователь найден, то возвращаем его

            if user is None:
                # Если пользователя нет — создаём нового
                user = m_users.User(
                    telegram_id=tg_id,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    language_code=language_code,
                    avatar_url=avatar_url,
                )
                s.add(user)  # Добавляем нового пользователя в сессию
            else:
                # Если пользователь найден — обновляем поля, если они были переданы
                if username is not None:
                    user.username = username
                if first_name is not None:
                    user.first_name = first_name
                if last_name is not None:
                    user.last_name = last_name
                if language_code is not None:
                    user.language_code = language_code
                if avatar_url is not None:
                    user.avatar_url = avatar_url

            await s.commit()  # Подтверждаем изменения в базе
            await s.refresh(user)  # Обновляем объект пользователя в памяти
            return user

    async def update_profile(
        self,
        user_id: int,
        *,
        bio: Optional[str] = None,
        city: Optional[str] = None,
        university: Optional[str] = None,
        link: Optional[str] = None,
    ) -> Optional[m_users.User]:
        """
        Обновление простых полей профиля пользователя по его user_id.
        Если данные были переданы, они сохраняются в базе.
        """
        async with self._sm() as s:
            user = await s.get(m_users.User, user_id)  # Получаем пользователя по id
            if not user:
                return None  # Если пользователя нет — возвращаем None

            # Обновляем только переданные поля
            if bio is not None:
                user.bio = bio
            if city is not None:
                user.city = city
            if university is not None:
                user.university = university
            if link is not None:
                user.link = link

            await s.commit()  # Подтверждаем изменения
            await s.refresh(user)  # Обновляем объект пользователя в памяти
            return user

    async def replace_user_skills_by_slugs(
        self,
        user_id: int,
        slugs: Iterable[str],
        max_count: int = 10,
    ) -> List[m_skill.Skill]:
        """
        Полная замена набора навыков пользователя по slug'ам.
        Проверяет количество навыков (не более max_count) и добавляет/удаляет их в базе.
        Возвращает итоговый список навыков пользователя.
        """
        # Нормализация slug'ов: обрезаем пробелы, приводим к нижнему регистру и убираем пустые строки
        normalized = [s.strip().lower() for s in slugs if s and s.strip()]
        uniq_slugs = list(dict.fromkeys(normalized))  # Убираем дубликаты из списка

        # Проверка: если количество уникальных навыков превышает max_count — выбрасываем ошибку
        if len(uniq_slugs) > max_count:
            raise ValueError(f"too_many_skills:{len(uniq_slugs)}>{max_count}")

        async with self._sm() as s:
            # Находим навыки по переданным slug'ам
            res = await s.execute(
                select(m_skill.Skill).where(m_skill.Skill.slug.in_(uniq_slugs))
            )
            skills = list(res.scalars().all())  # Собираем список найденных навыков

            # Находим неизвестные slug'и, которые отсутствуют в БД
            found_slugs = {sk.slug for sk in skills}
            unknown = [slug for slug in uniq_slugs if slug not in found_slugs]
            if unknown:
                # Если есть неизвестные навыки — выбрасываем ошибку
                raise ValueError("unknown_skills:" + ",".join(unknown))

            # Получаем текущие связи пользователя с навыками
            cur_res = await s.execute(
                select(m_us.user_skill.c.skill_id).where(m_us.user_skill.c.user_id == user_id)
            )
            current_ids = set(cur_res.scalars().all())  # Текущие идентификаторы навыков пользователя
            new_ids = {sk.id for sk in skills}  # Новые идентификаторы, которые мы хотим добавить

            # 1) Удаляем старые связи (если есть такие навыки, которые не должны быть у пользователя)
            to_del = current_ids - new_ids
            if to_del:
                await s.execute(
                    delete(m_us.user_skill).where(
                        (m_us.user_skill.c.user_id == user_id)
                        & (m_us.user_skill.c.skill_id.in_(to_del))
                    )
                )

            # 2) Добавляем новые связи (если пользователь должен иметь эти навыки)
            to_add = new_ids - current_ids
            if to_add:
                await s.execute(
                    insert(m_us.user_skill),
                    [{"user_id": user_id, "skill_id": sid} for sid in to_add],
                )

            await s.commit()  # Фиксируем изменения

            # Возвращаем обновлённый список навыков пользователя (отсортированный по имени)
            if new_ids:
                res2 = await s.execute(
                    select(m_skill.Skill)
                    .where(m_skill.Skill.id.in_(new_ids))
                    .order_by(m_skill.Skill.name.asc())
                )
                return list(res2.scalars().all())
            return []

    # ---------- ПОИСК ----------

    async def search_users(
        self,
        q: Optional[str],
        skill_slugs: Optional[Sequence[str]],
        mode: str,
        limit: int,
        offset: int,
    ) -> Tuple[List[tuple[m_users.User, Optional[int]]], int]:
        """
        Поиск пользователей по тексту (username, first_name, last_name) и/или навыкам.
        Возвращает список пользователей и их соответствие с навыками (match_count).
        """
        u = m_users.User  # Ссылка на модель User

        # Вспомогательная функция для применения текстового фильтра
        def _apply_text_filter(stmt):
            if not q:
                return stmt  # Если нет текста для фильтрации, просто возвращаем запрос без изменений
            q_like = f"%{q.lower()}%"  # Создаём шаблон для поиска по username и имени пользователя
            full_expr = func.concat(
                func.coalesce(u.first_name, ""),
                literal(" "),
                func.coalesce(u.last_name, ""),
            )
            # Применяем фильтрацию как для username, так и для "Имя Фамилия"
            return stmt.where(func.lower(u.username).like(q_like) | full_expr.ilike(f"%{q}%"))

        async with self._sm() as s:
            # Если не фильтруем по навыкам, то просто ищем по тексту
            if not skill_slugs:
                base = _apply_text_filter(select(u)).order_by(u.updated_at.desc())
                total = (await s.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
                res = await s.execute(base.limit(limit).offset(offset))
                items: List[tuple[m_users.User, Optional[int]]] = [(usr, None) for usr in res.scalars().all()]
                return items, total

            # Нормализуем навыки (slug) для фильтрации
            slugs = [s_.strip().lower() for s_ in skill_slugs if s_ and s_.strip()]
            sk = m_skill.Skill
            us = m_us.user_skill

            # Получаем id навыков
            ids_arr = (await s.execute(select(sk.id).where(sk.slug.in_(slugs)))).scalars().all()
            found_slugs = set((await s.execute(select(sk.slug).where(sk.slug.in_(slugs)))).scalars().all())
            unknown = [slug for slug in slugs if slug not in found_slugs]
            if unknown:
                # Если есть неизвестные скиллы — выбрасываем ошибку
                raise ValueError("unknown_skills:" + ",".join(unknown))

            if mode == "all":
                # Пользователи, у которых есть все указанные навыки
                sub = (
                    select(us.c.user_id)
                    .where(us.c.skill_id.in_(ids_arr))
                    .group_by(us.c.user_id)
                    .having(func.count(func.distinct(us.c.skill_id)) == len(ids_arr))  # Все навыки должны быть у пользователя
                )
                filtered = _apply_text_filter(select(u).where(u.id.in_(sub))).order_by(u.updated_at.desc())
                total = (await s.execute(select(func.count()).select_from(filtered.subquery()))).scalar_one()
                res = await s.execute(filtered.limit(limit).offset(offset))
                items = [(usr, None) for usr in res.scalars().all()]
                return items, total
            else:
                # Пользователи, у которых есть хотя бы один из указанных навыков
                sub = (
                    select(us.c.user_id, func.count().label("mc"))
                    .where(us.c.skill_id.in_(ids_arr))
                    .group_by(us.c.user_id)
                    .subquery()
                )
                filtered = _apply_text_filter(
                    select(u, sub.c.mc.label("match_count")).join(sub, sub.c.user_id == u.id)
                ).order_by(sub.c.mc.desc(), u.updated_at.desc())

                total = (await s.execute(select(func.count()).select_from(filtered.subquery()))).scalar_one()
                res = await s.execute(filtered.limit(limit).offset(offset))

                items = [(usr, int(mc)) for (usr, mc) in res.all()]
                return items, total
