# Этот файл реализует репозиторий для работы с пользователями в базе данных.
# Репозиторий предоставляет методы для выполнения операций CRUD с пользователями, их навыками и поиском по различным фильтрам.
# Он также включает логику для работы с навыками пользователя, создания новых пользователей и обновления их профилей.

from __future__ import annotations
from typing import Optional, Sequence, Iterable, List, Tuple

from sqlalchemy.ext.asyncio import AsyncSession  # Для работы с асинхронными сессиями SQLAlchemy
from sqlalchemy import select, func, literal  # Для выполнения SQL-запросов и функций
# from sqlalchemy.orm import aliased  # не нужен сейчас

from backend.persistend.models import users as m_users  # Импорт модели пользователей
from backend.persistend.models import skill as m_skill  # Импорт модели навыков
from backend.persistend.models import user_skill as m_us  # Импорт таблицы связей пользователей с навыками

# Репозиторий для работы с пользователями
class UsersRepo:
    def __init__(self, s: AsyncSession):
        self.s = s  # Инициализация сессии SQLAlchemy для выполнения запросов

    # Получить пользователя по ID
    async def get_by_id(self, user_id: int) -> Optional[m_users.User]:
        # Выполняем SQL-запрос для получения пользователя с заданным ID
        res = await self.s.execute(
            select(m_users.User).where(m_users.User.id == user_id).limit(1)
        )
        # Возвращаем первого найденного пользователя или None, если не найден
        return res.scalars().first()

    # Получить пользователя по telegram_id
    async def get_by_telegram_id(self, tg_id: int) -> Optional[m_users.User]:
        # Выполняем SQL-запрос для получения пользователя по telegram_id
        res = await self.s.execute(
            select(m_users.User).where(m_users.User.telegram_id == tg_id).limit(1)
        )
        # Возвращаем первого найденного пользователя или None, если не найден
        return res.scalars().first()

    # Обновить или создать пользователя на основе данных из Telegram
    async def upsert_from_tg(self, profile: dict) -> m_users.User:
        tg_id = int(profile["id"])  # Извлекаем telegram_id из профиля
        user = await self.get_by_telegram_id(tg_id)  # Проверяем, существует ли пользователь с таким tg_id

        if user is None:
            # Если пользователя нет, создаем нового
            user = m_users.User(
                telegram_id=tg_id,
                username=profile.get("username"),
                first_name=profile.get("first_name"),
                last_name=profile.get("last_name"),
                language_code=profile.get("language_code"),
                avatar_url=profile.get("photo_url"),
            )
            # Добавляем нового пользователя в сессию
            self.s.add(user)
            # Выполняем коммит изменений в базу данных
            await self.s.flush()
            return user

        # Если пользователь найден, обновляем его данные
        user.username = profile.get("username") or user.username
        user.first_name = profile.get("first_name") or user.first_name
        user.last_name = profile.get("last_name") or user.last_name
        user.language_code = profile.get("language_code") or user.language_code
        user.avatar_url = profile.get("photo_url") or user.avatar_url
        # Выполняем коммит изменений в базу данных
        await self.s.flush()
        return user

    # Обновить профиль пользователя (например, bio, город, университет, ссылку)
    async def update_profile_fields(self, user: m_users.User, data: dict) -> m_users.User:
        # Проходим по ключам в data и обновляем только те, которые не равны None
        for k in ("bio", "city", "university", "link"):
            if k in data and data[k] is not None:
                setattr(user, k, data[k])  # Обновляем атрибут пользователя
        await self.s.flush()  # Сохраняем изменения в базе данных
        return user

    # Получить навыки пользователя по его ID
    async def get_user_skills(self, user_id: int) -> Sequence[m_skill.Skill]:
        # Формируем запрос для получения всех навыков пользователя, отсортированных по имени
        q = (
            select(m_skill.Skill)
            .join(m_us.user_skill, m_us.user_skill.c.skill_id == m_skill.Skill.id)  # Соединяем таблицы user_skill и skill
            .where(m_us.user_skill.c.user_id == user_id)  # Фильтруем по user_id
            .order_by(m_skill.Skill.name.asc())  # Сортируем по имени навыка
        )
        # Выполняем запрос и возвращаем результаты
        return (await self.s.execute(q)).scalars().all()

    # Заменить навыки пользователя по их slug-ам
    async def replace_user_skills_by_slugs(
        self, user_id: int, slugs: Iterable[str], max_count: int = 10
    ) -> Sequence[m_skill.Skill]:
        # Преобразуем slugs в нижний регистр и удаляем пустые
        slugs = [s.strip().lower() for s in slugs if s and s.strip()]
        uniq = list(dict.fromkeys(slugs))  # Убираем дубли
        if len(uniq) > max_count:
            raise ValueError(f"too_many_skills:{len(uniq)}>{max_count}")  # Проверяем, что количество не превышает max_count

        # Находим навыки по slug
        skills = (await self.s.execute(
            select(m_skill.Skill).where(m_skill.Skill.slug.in_(uniq))
        )).scalars().all()

        # Проверяем, что все slugs найдены в базе
        found_slugs = {s.slug for s in skills}
        unknown = [s for s in uniq if s not in found_slugs]
        if unknown:
            raise ValueError("unknown_skills:" + ",".join(unknown))  # Если есть неизвестные slugs, выбрасываем ошибку

        # Получаем текущие навыки пользователя
        current = (
            await self.s.execute(
                select(m_us.user_skill.c.skill_id).where(m_us.user_skill.c.user_id == user_id)
            )
        ).scalars().all()
        current_set = set(current)
        new_set = {s.id for s in skills}

        # Удаляем лишние навыки
        to_del = current_set - new_set
        if to_del:
            await self.s.execute(
                m_us.user_skill.delete().where(
                    (m_us.user_skill.c.user_id == user_id)
                    & (m_us.user_skill.c.skill_id.in_(to_del))
                )
            )

        # Добавляем новые навыки
        to_add = new_set - current_set
        if to_add:
            await self.s.execute(
                m_us.user_skill.insert(),
                [{"user_id": user_id, "skill_id": sid} for sid in to_add],
            )

        await self.s.flush()  # Применяем изменения в базе данных
        return skills

    # Поиск пользователей по тексту, навыкам и другим фильтрам
    async def search_users(
        self,
        q: Optional[str],
        skill_slugs: Optional[Sequence[str]],
        mode: str,
        limit: int,
        offset: int,
    ) -> Tuple[List[tuple[m_users.User, Optional[int]]], int]:
        u = m_users.User  # Модель пользователя
        base = select(u)  # Основной запрос на выборку пользователей

        # Текстовый поиск по username и fio (first_name, last_name)
        if q:
            q_like = f"%{q.lower()}%"  # Формируем шаблон для поиска
            full_expr = func.concat(
                func.coalesce(u.first_name, ""), literal(" "), func.coalesce(u.last_name, "")
            )
            # Добавляем условие для поиска по имени и фамилии или username
            base = base.where(
                func.lower(u.username).like(q_like) | full_expr.ilike(f"%{q}%")
            )

        total: Optional[int] = None  # Общее количество найденных пользователей
        match_count_col = None  # Столбец для подсчета совпадений по навыкам

        if skill_slugs:
            slugs = [s.strip().lower() for s in skill_slugs if s and s.strip()]
            sk = m_skill.Skill
            us = m_us.user_skill  # Это таблица связей между пользователями и их навыками

            # Находим навыки по slug
            ids_arr = (
                await self.s.execute(select(sk.id).where(sk.slug.in_(slugs)))
            ).scalars().all()

            # Проверяем, что все slugs были найдены
            found_slugs = set(
                (await self.s.execute(select(sk.slug).where(sk.slug.in_(slugs)))).scalars().all()
            )
            unknown = [s for s in slugs if s not in found_slugs]
            if unknown:
                raise ValueError("unknown_skills:" + ",".join(unknown))

            if mode == "all":
                # Если режим "all", то ищем пользователей, у которых есть все указанные навыки
                sub = (
                    select(us.c.user_id)
                    .where(us.c.skill_id.in_(ids_arr))
                    .group_by(us.c.user_id)
                    .having(func.count(func.distinct(us.c.skill_id)) == len(ids_arr))
                )
                base = base.where(u.id.in_(sub))
                # Подсчитываем количество таких пользователей
                cnt = await self.s.execute(
                    select(func.count()).select_from(select(u.id).where(u.id.in_(sub)).subquery())
                )
                total = cnt.scalar_one()
            else:
                # Если режим не "all", ищем пользователей с любым из указанных навыков
                sub = (
                    select(us.c.user_id, func.count().label("mc"))
                    .where(us.c.skill_id.in_(ids_arr))
                    .group_by(us.c.user_id)
                    .subquery()
                )
                base = select(u, sub.c.mc.label("match_count")).join(sub, sub.c.user_id == u.id)
                # Подсчитываем количество таких пользователей
                cnt = await self.s.execute(select(func.count()).select_from(sub))
                total = cnt.scalar_one()
                match_count_col = sub.c.mc

        # Сортировка и пагинация
        if match_count_col is not None:
            base = base.order_by(match_count_col.desc(), u.updated_at.desc())
        else:
            base = base.order_by(u.updated_at.desc())

        if total is None:
            # Если общее количество не посчитано, считаем его
            cnt = await self.s.execute(select(func.count()).select_from(base.subquery()))
            total = cnt.scalar_one()

        # Выполняем запрос с ограничением на количество и смещением для пагинации
        res = await self.s.execute(base.limit(limit).offset(offset))

        items: List[tuple[m_users.User, Optional[int]]] = []
        if match_count_col is not None:
            # Если подсчитываем количество совпадений, добавляем их в результат
            for usr, mc in res.all():
                items.append((usr, int(mc)))
        else:
            # Если нет подсчета совпадений, просто добавляем пользователей
            for usr in res.scalars().all():
                items.append((usr, None))
        return items, total  # Возвращаем найденных пользователей и общее количество
