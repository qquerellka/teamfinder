# admin_bot/main.py
from __future__ import annotations

import asyncio

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from admin_bot.config import settings
from admin_bot.handlers import hackathons


async def main():
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher(storage=MemoryStorage())

    dp.include_router(hackathons.router)

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
