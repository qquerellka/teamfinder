# src/repositories/users.py
from sqlalchemy import select, insert
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.user import User

async def upsert_from_tg_profile(
    session: AsyncSession,
    tg_id: int,
    username: str | None,
    first_name: str | None,
    last_name: str | None,
    lang: str | None,
):
    stmt = pg_insert(User).values(
        telegram_id=tg_id,
        username=username,
        name=first_name,
        surname=last_name,
        language_code=lang,
    ).on_conflict_do_update(
        index_elements=[User.telegram_id],
        set_={
            "username": username,
            "name": first_name,
            "surname": last_name,
            "language_code": lang,
        }
    ).returning(User)
    res = await session.execute(stmt)
    user = res.scalar_one()
    await session.commit()
    return user

async def get_by_telegram_id(session: AsyncSession, tg_id: int) -> User | None:
    q = select(User).where(User.telegram_id == tg_id)
    res = await session.execute(q)
    return res.scalar_one_or_none()
