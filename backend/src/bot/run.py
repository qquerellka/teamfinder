import logging
import asyncio
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

from src.core.config import settings
from src.core.db import engine, AsyncSessionLocal, Base
from src.repositories.users import upsert_from_tg_profile

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("bot")

async def ensure_schema():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    u = update.effective_user
    async with AsyncSessionLocal() as session:
        user = await upsert_from_tg_profile(
            session,
            tg_id=u.id,
            username=u.username,
            name=u.name,
            surname=u.surname,
            lang=u.language_code,
        )
    await update.message.reply_text(f"Привет, {u.first_name}! Твой id в БД: {user.id}")

async def main():
    # 1) всё в одном event loop
    await ensure_schema()

    app = ApplicationBuilder().token(settings.telegram_bot_token).build()
    app.add_handler(CommandHandler("start", start_cmd))

    log.info("Bot started (async).")

    # 2) ручной lifecycle вместо run_polling()
    await app.initialize()
    await app.start()
    await app.updater.start_polling()

    try:
        # 3) держим приложение "вечно"
        await asyncio.Future()
    except asyncio.CancelledError:
        pass
    finally:
        # 4) корректная остановка
        await app.updater.stop()
        await app.stop()
        await app.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
