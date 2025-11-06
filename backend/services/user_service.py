from repositories.db.user_repository import UserRepository


class UserService:
    def __init__(self):
        self.user_repository = UserRepository()

    async def upsert_user(self, user_data: dict) -> dict:
        return await self.user_repository.upsert_user(user_data)

    async def get_user_by_telegram_id(self, telegram_id: int) -> dict | None:
        return await self.user_repository.get_user_by_telegram_id(telegram_id)

    async def get_all_users(self) -> list[dict]:
        return await self.user_repository.get_all_users()

    async def upsert_user_from_telegram(self, tg_data):
        print("upsert_user_from_telegram: получил данные:", tg_data)

        # Преобразуем raw-данные из Telegram в формат, который ждёт репозиторий
        user_data = {
            "telegram_id": tg_data["telegram_id"],
            "username": tg_data.get("username"),
            "name": tg_data.get("name"),
            "surname": tg_data.get("surname"),
            "avatar_url": tg_data.get("avatar_url"),
            "bio": tg_data.get("bio"),
            "age": tg_data.get("age"),
            "city": tg_data.get("city"),
            "university": tg_data.get("university"),
            "link": str(tg_data.get("link")) if tg_data.get("link") else None,
            "skills": tg_data.get("skills") or [],
        }

        return await self.user_repository.upsert_user(user_data)

