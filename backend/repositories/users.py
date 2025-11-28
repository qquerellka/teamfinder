from __future__ import annotations

from typing import Iterable, List, Optional, Sequence, Tuple

from sqlalchemy import delete, func, insert, literal, select

from backend.persistend.models import achievement as m_ach
from backend.persistend.models import skill as m_skill
from backend.persistend.models import user_skill as m_us
from backend.persistend.models import users as m_users
from backend.repositories.base import BaseRepository


class UsersRepo(BaseRepository):
    """Репозиторий для работы с пользователями и их навыками."""

    # ---------- ЧТЕНИЕ ----------

    async def get_by_id(self, user_id: int) -> Optional[m_users.User]:
        async with self._sm() as s:
            return await s.get(m_users.User, user_id)

    async def get_by_telegram_id(self, tg_id: int) -> Optional[m_users.User]:
        async with self._sm() as s:
            res = await s.execute(
                select(m_users.User).where(m_users.User.telegram_id == tg_id).limit(1)
            )
            return res.scalars().first()

    async def get_user_skills(self, user_id: int) -> List[m_skill.Skill]:
        async with self._sm() as s:
            stmt = (
                select(m_skill.Skill)
                .join(m_us.user_skill, m_us.user_skill.c.skill_id == m_skill.Skill.id)
                .where(m_us.user_skill.c.user_id == user_id)
                .order_by(m_skill.Skill.name.asc())
            )
            res = await s.execute(stmt)
            return list(res.scalars().all())

    async def get_user_achievements(self, user_id: int) -> List[m_ach.Achievement]:
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
        Создать или обновить пользователя по данным Telegram.
        Ищем по telegram_id, при наличии — обновляем, иначе создаём.
        """
        tg_id = int(profile["id"])
        username = profile.get("username")
        first_name = profile.get("first_name")
        last_name = profile.get("last_name")
        language_code = profile.get("language_code")
        avatar_url = profile.get("photo_url")

        async with self._sm() as s:
            res = await s.execute(
                select(m_users.User).where(m_users.User.telegram_id == tg_id).limit(1)
            )
            user = res.scalars().first()

            if user is None:
                user = m_users.User(
                    telegram_id=tg_id,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    language_code=language_code,
                    avatar_url=avatar_url,
                )
                s.add(user)
            else:
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

            await s.commit()
            await s.refresh(user)
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
        Частичное обновление простых полей профиля.
        Обновляет только те поля, которые переданы явно.
        """
        async with self._sm() as s:
            user = await s.get(m_users.User, user_id)
            if not user:
                return None

            if bio is not None:
                user.bio = bio
            if city is not None:
                user.city = city
            if university is not None:
                user.university = university
            if link is not None:
                user.link = link

            await s.commit()
            await s.refresh(user)
            return user

    async def replace_user_skills_by_slugs(
        self,
        user_id: int,
        slugs: Iterable[str],
        max_count: int = 10,
    ) -> List[m_skill.Skill]:
        """
        Полностью заменить набор навыков пользователя по slug'ам.
        Проверяет лимит и валидность скиллов.
        """
        normalized = [s.strip().lower() for s in slugs if s and s.strip()]
        uniq_slugs = list(dict.fromkeys(normalized))

        if len(uniq_slugs) > max_count:
            raise ValueError(f"too_many_skills:{len(uniq_slugs)}>{max_count}")

        async with self._sm() as s:
            res = await s.execute(
                select(m_skill.Skill).where(m_skill.Skill.slug.in_(uniq_slugs))
            )
            skills = list(res.scalars().all())

            found_slugs = {sk.slug for sk in skills}
            unknown = [slug for slug in uniq_slugs if slug not in found_slugs]
            if unknown:
                raise ValueError("unknown_skills:" + ",".join(unknown))

            cur_res = await s.execute(
                select(m_us.user_skill.c.skill_id).where(
                    m_us.user_skill.c.user_id == user_id
                )
            )
            current_ids = set(cur_res.scalars().all())
            new_ids = {sk.id for sk in skills}

            to_del = current_ids - new_ids
            if to_del:
                await s.execute(
                    delete(m_us.user_skill).where(
                        (m_us.user_skill.c.user_id == user_id)
                        & (m_us.user_skill.c.skill_id.in_(to_del))
                    )
                )

            to_add = new_ids - current_ids
            if to_add:
                await s.execute(
                    insert(m_us.user_skill),
                    [{"user_id": user_id, "skill_id": sid} for sid in to_add],
                )

            await s.commit()

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
        Поиск пользователей по тексту (username, first_name, last_name)
        и/или навыкам. Возвращает (список (user, match_count), total).
        """
        u = m_users.User

        def _apply_text_filter(stmt):
            if not q:
                return stmt
            q_like = f"%{q.lower()}%"
            full_expr = func.concat(
                func.coalesce(u.first_name, ""),
                literal(" "),
                func.coalesce(u.last_name, ""),
            )
            return stmt.where(
                func.lower(u.username).like(q_like) | full_expr.ilike(f"%{q}%")
            )

        async with self._sm() as s:
            # Без фильтра по скиллам — только текст
            if not skill_slugs:
                base = _apply_text_filter(select(u).order_by(u.updated_at.desc()))
                total = (
                    await s.execute(select(func.count()).select_from(base.subquery()))
                ).scalar_one()
                res = await s.execute(base.limit(limit).offset(offset))
                items: List[tuple[m_users.User, Optional[int]]] = [
                    (usr, None) for usr in res.scalars().all()
                ]
                return items, total

            slugs = [s_.strip().lower() for s_ in skill_slugs if s_ and s_.strip()]
            sk = m_skill.Skill
            us = m_us.user_skill

            ids_arr = (
                (await s.execute(select(sk.id).where(sk.slug.in_(slugs))))
                .scalars()
                .all()
            )

            found_slugs = set(
                (await s.execute(select(sk.slug).where(sk.slug.in_(slugs))))
                .scalars()
                .all()
            )
            unknown = [slug for slug in slugs if slug not in found_slugs]
            if unknown:
                raise ValueError("unknown_skills:" + ",".join(unknown))

            if mode == "all":
                sub = (
                    select(us.c.user_id)
                    .where(us.c.skill_id.in_(ids_arr))
                    .group_by(us.c.user_id)
                    .having(func.count(func.distinct(us.c.skill_id)) == len(ids_arr))
                )
                filtered = _apply_text_filter(
                    select(u).where(u.id.in_(sub)).order_by(u.updated_at.desc())
                )
                total = (
                    await s.execute(
                        select(func.count()).select_from(filtered.subquery())
                    )
                ).scalar_one()
                res = await s.execute(filtered.limit(limit).offset(offset))
                items = [(usr, None) for usr in res.scalars().all()]
                return items, total

            # mode != "all" → пользователи, у которых есть хотя бы один скилл
            sub = (
                select(us.c.user_id, func.count().label("mc"))
                .where(us.c.skill_id.in_(ids_arr))
                .group_by(us.c.user_id)
                .subquery()
            )
            filtered = _apply_text_filter(
                select(u, sub.c.mc.label("match_count"))
                .join(sub, sub.c.user_id == u.id)
                .order_by(sub.c.mc.desc(), u.updated_at.desc())
            )

            total = (
                await s.execute(select(func.count()).select_from(filtered.subquery()))
            ).scalar_one()
            res = await s.execute(filtered.limit(limit).offset(offset))

            items = [(usr, int(mc)) for (usr, mc) in res.all()]
            return items, total
