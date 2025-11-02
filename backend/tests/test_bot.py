import pytest
from aiogram.types import Message, User, Chat
from src.bot.app import router  # где зарегистрированы хэндлеры
from src.bot.handlers import start, profile  # или твои модули
from src.repositories.users import UsersRepository

class DummyMessage(Message):
    # упрощённый конструктор
    def __init__(self, text, user_id=123, username="andrey"):
        super().__init__(
            message_id=1,
            date=None,
            chat=Chat(id=user_id, type="private"),
            from_user=User(id=user_id, is_bot=False, first_name="Andrey", username=username),
            text=text
        )
    async def answer(self, text, **kwargs):
        self._answer = text

@pytest.mark.asyncio
async def test_start_text(pg_url):
    msg = DummyMessage("/start")
    await start.cmd_start(msg)  # твой хэндлер
    assert "Привет" in msg._answer

@pytest.mark.asyncio
async def test_profile_reads_db(pg_url):
    repo = UsersRepository()
    repo.create(telegramID=123, username="andrey", name="Андрей")
    msg = DummyMessage("/profile", user_id=123, username="andrey")
    await profile.cmd_profile(msg)
    assert "Андрей" in msg._answer
