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
                return {k: v for k, v in created._mapping.items()} if created else {}
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
                return {k: v for k, v in updated._mapping.items()} if updated else {}

