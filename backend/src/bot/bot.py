from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from core.config import get_settings
from core.db import init_pool, close_pool, execute, fetchrow

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    u = update.effective_user
    # upsert пользователя
    await execute(
        """
        INSERT INTO "user"(telegram_id, username, name, surname, language_code)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (telegram_id) DO UPDATE
        SET username = EXCLUDED.username,
            name = EXCLUDED.name,
            surname = EXCLUDED.surname,
            updated_at = now()
        """,
        u.id,
        u.username,
        (u.first_name or None),
        (u.last_name or None),
        (u.language_code or None),
    )
    await update.message.reply_text("Привет! Я тебя запомнил в базе.")

async def ping(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("pong")

async def me(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    row = await fetchrow('SELECT id, telegram_id, username, name, surname FROM "user" WHERE telegram_id = %s', update.effective_user.id)
    if not row:
        await update.message.reply_text("В базе тебя ещё нет. Напиши /start")
        return
    txt = f'ID: {row["id"]}\nTG: {row["telegram_id"]}\nusername: {row["username"]}\nname: {row["name"]} {row["surname"]}'
    await update.message.reply_text(txt)

async def on_startup(app: Application) -> None:
    await init_pool()

async def on_shutdown(app: Application) -> None:
    await close_pool()

def build_app() -> Application:
    settings = get_settings()
    app = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("ping", ping))
    app.add_handler(CommandHandler("me", me))
    app.post_init = on_startup
    app.post_shutdown = on_shutdown
    return app
