from persistent.db.user import User
from infrastructure.postgres.connect import pg_connection
from sqlalchemy import insert, select, update


class UserRepository:
    def __init__(self) -> None:
        self._sessionmaker = pg_connection()

    async def upsert_user(self, user_data: dict) -> dict:
        """
        -- UPSERT: insert into user if not exists, else update
        """
        async with self._sessionmaker() as session:
            stmt = select(User).where(User.telegram_id == user_data["telegram_id"])
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()

            if user is None:
                # INSERT INTO user (columns...) VALUES (values...) RETURNING *
                stmt = insert(User).values(**user_data).returning(User)
                result = await session.execute(stmt)
                await session.commit()
                created = result.fetchone()
                return dict(created._mapping) if created else {}
            else:
                # UPDATE user SET ... WHERE telegram_id = ... RETURNING *
                stmt = (
                    update(User)
                    .where(User.telegram_id == user_data["telegram_id"])
                    .values(**user_data)
                    .returning(User)
                )
                result = await session.execute(stmt)
                await session.commit()
                updated = result.fetchone()
                return dict(updated._mapping) if updated else {}

    async def get_user_by_telegram_id(self, telegram_id: int) -> dict | None:
        """
        -- SELECT * FROM user WHERE telegram_id = {telegram_id} LIMIT 1
        """
        stmt = select(User).where(User.telegram_id == telegram_id).limit(1)

        async with self._sessionmaker() as session:
            result = await session.execute(stmt)

        user = result.fetchone()
        if user:
            return dict(user._mapping)
        return None

    async def get_all_users(self) -> list[dict]:
        """
        -- SELECT * FROM user ORDER BY created_at
        """
        stmt = select(
            User.id, User.telegram_id, User.username, User.name, User.surname,
            User.bio, User.age, User.city, User.university, User.link, User.skills,
            User.created_at, User.updated_at
        ).order_by(User.created_at)

        async with self._sessionmaker() as session:
            result = await session.execute(stmt)

        users = result.fetchall()
        keys = [col.name for col in stmt.selected_columns]
        return [dict(zip(keys, row)) for row in users]
