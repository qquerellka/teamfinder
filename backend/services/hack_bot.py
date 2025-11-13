import logging
import os
import sys
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove, BotCommand
from telegram.ext import (
    Application, CommandHandler, MessageHandler, filters, 
    ContextTypes, ConversationHandler
)
from datetime import datetime
import asyncio
from pathlib import Path

# Добавляем корень проекта в Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

# Импортируем наши модули

from backend.infrastructure.db import get_sessionmaker
from backend.persistend.models.hackathon import Hackathon
from backend.repositories.hackathons import HackathonsRepo
from backend.persistend.base import Base
from sqlalchemy import text
SessionLocal = get_sessionmaker()
print("✅ Все импорты успешны!")


# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Состояния для добавления хакатона
(
    HACK_NAME, HACK_DESCRIPTION, HACK_IMAGE, HACK_START_DATE, HACK_END_DATE,
    HACK_REG_END_DATE, HACK_MODE, HACK_CITY, HACK_MIN_MEMBERS, HACK_MAX_MEMBERS,
    HACK_REG_LINK, HACK_PRIZE, HACK_STATUS, CONFIRMATION
) = range(14)


class HackathonBot:
    def __init__(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN", "8305733195:AAGIbvW24yWs_eVTxeZe3eurL3LvWaPdfNI")
        self.application = None
    
    
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обработчик команды /start"""
        user = update.message.from_user
        welcome_text = f"""
👋 Привет, {user.first_name}!

Добро пожаловать в бот для управления хакатонами!

Доступные команды:
/start - начать работу
/add_hackathon - добавить новый хакатон
/list_hackathons - список всех хакатонов
/cancel - отменить текущую операцию
/help - помощь
"""
        await update.message.reply_text(welcome_text)
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обработчик команды /help"""
        help_text = """
📋 Помощь по использованию бота:

/start - начать работу с ботом
/add_hackathon - добавить новый хакатон
/list_hackathons - показать все хакатоны
/cancel - отменить текущую операцию
/help - показать эту справку

Процесс добавления хакатона:
1. Название хакатона
2. Описание
3. Ссылка на изображение
4. Дата начала
5. Дата окончания
6. Дата окончания регистрации
7. Формат (online/offline/hybrid)
8. Город
9. Минимальное количество участников
10. Максимальное количество участников
11. Ссылка для регистрации
12. Призовой фонд
13. Статус
14. Подтверждение
"""
        await update.message.reply_text(help_text)
    
    async def add_hackathon(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Начало добавления хакатона"""
        await update.message.reply_text(
            "🚀 Начинаем добавление нового хакатона!\n\n"
            "Введите название хакатона:",
            reply_markup=ReplyKeyboardRemove()
        )
        return HACK_NAME
    
    async def hackathon_name(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение названия хакатона"""
        context.user_data['name'] = update.message.text
        await update.message.reply_text("📝 Введите описание хакатона:")
        return HACK_DESCRIPTION
    
    async def hackathon_description(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение описания"""
        context.user_data['description'] = update.message.text
        await update.message.reply_text("🖼️ Введите ссылку на изображение (или 'пропустить'):")
        return HACK_IMAGE
    
    async def hackathon_image(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение изображения"""
        if update.message.text.lower() != 'пропустить':
            context.user_data['image_link'] = update.message.text
        else:
            context.user_data['image_link'] = None
        
        await update.message.reply_text(
            "📅 Введите дату начала хакатона (формат: ГГГГ-ММ-ДД ЧЧ:ММ:СС):\n"
            "Пример: 2024-12-01 10:00:00"
        )
        return HACK_START_DATE
    
    async def hackathon_start_date(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение даты начала"""
        context.user_data['start_date'] = update.message.text
        await update.message.reply_text(
            "📅 Введите дату окончания хакатона (формат: ГГГГ-ММ-ДД ЧЧ:ММ:СС):\n"
            "Пример: 2024-12-03 18:00:00"
        )
        return HACK_END_DATE
    
    async def hackathon_end_date(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение даты окончания"""
        context.user_data['end_date'] = update.message.text
        await update.message.reply_text(
            "📅 Введите дату окончания регистрации (формат: ГГГГ-ММ-ДД ЧЧ:ММ:СС или 'пропустить'):\n"
            "Пример: 2024-11-25 23:59:59"
        )
        return HACK_REG_END_DATE
    
    async def hackathon_reg_end_date(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение даты окончания регистрации"""
        if update.message.text.lower() != 'пропустить':
            context.user_data['registration_end_date'] = update.message.text
        else:
            context.user_data['registration_end_date'] = None
        
        await update.message.reply_text(
            "🌐 Выберите формат проведения:",
            reply_markup=ReplyKeyboardMarkup(
                [['online', 'offline', 'hybrid']], 
                one_time_keyboard=True
            )
        )
        return HACK_MODE
    
    async def hackathon_mode(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение формата"""
        context.user_data['mode'] = update.message.text
        await update.message.reply_text(
            "🏙️ Введите город проведения (или 'пропустить' для онлайн):",
            reply_markup=ReplyKeyboardRemove()
        )
        return HACK_CITY
    
    async def hackathon_city(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение города"""
        if update.message.text.lower() != 'пропустить':
            context.user_data['city'] = update.message.text
        else:
            context.user_data['city'] = None
        
        await update.message.reply_text("👥 Введите минимальное количество участников в команде:")
        return HACK_MIN_MEMBERS
    
    async def hackathon_min_members(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение минимального количества участников"""
        try:
            context.user_data['team_members_minimum'] = int(update.message.text)
            await update.message.reply_text("👥 Введите максимальное количество участников в команде:")
            return HACK_MAX_MEMBERS
        except ValueError:
            await update.message.reply_text("❌ Введите число. Попробуйте еще раз:")
            return HACK_MIN_MEMBERS
    
    async def hackathon_max_members(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение максимального количества участников"""
        try:
            context.user_data['team_members_limit'] = int(update.message.text)
            await update.message.reply_text("🔗 Введите ссылку для регистрации:")
            return HACK_REG_LINK
        except ValueError:
            await update.message.reply_text("❌ Введите число. Попробуйте еще раз:")
            return HACK_MAX_MEMBERS
    
    async def hackathon_reg_link(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение ссылки для регистрации"""
        context.user_data['registration_link'] = update.message.text
        await update.message.reply_text("💰 Введите призовой фонд:")
        return HACK_PRIZE
    
    async def hackathon_prize(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение призового фонда"""
        context.user_data['prize_fund'] = update.message.text
        await update.message.reply_text(
            "📊 Выберите статус хакатона:",
            reply_markup=ReplyKeyboardMarkup(
                [['draft', 'open', 'closed']], 
                one_time_keyboard=True
            )
        )
        return HACK_STATUS
    
    async def hackathon_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Получение статуса"""
        context.user_data['status'] = update.message.text
        
        # Формируем информацию для подтверждения
        hackathon_info = f"""
        ✅ Пожалуйста, проверьте введенные данные:

        🏷️ Название: {context.user_data['name']}
        📝 Описание: {context.user_data['description']}
        🖼️ Изображение: {context.user_data.get('image_link', 'не указано')}
        📅 Начало: {context.user_data['start_date']}
        📅 Окончание: {context.user_data['end_date']}
        📅 Регистрация до: {context.user_data.get('registration_end_date', 'не указано')}
        🌐 Формат: {context.user_data['mode']}
        🏙️ Город: {context.user_data.get('city', 'не указан')}
        👥 Участники: {context.user_data['team_members_minimum']}-{context.user_data['team_members_limit']}
        🔗 Ссылка: {context.user_data['registration_link']}
        💰 Призы: {context.user_data['prize_fund']}
        📊 Статус: {context.user_data['status']}

        Всё верно? (да/нет)
        """
    
        await update.message.reply_text(
            hackathon_info,
            reply_markup=ReplyKeyboardMarkup([['да', 'нет']], one_time_keyboard=True)
        )
        return CONFIRMATION
    
    def _parse_date(self, date_str: str) -> datetime:
        """Парсит дату из строки в datetime"""
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d %H:%M',
            '%Y-%m-%d',
            '%d.%m.%Y %H:%M:%S',
            '%d.%m.%Y %H:%M',
            '%d.%m.%Y'
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        raise ValueError(f"Неверный формат даты: {date_str}")
    
    async def confirmation(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Подтверждение и сохранение"""
        user_response = update.message.text.lower()
        
        if user_response in ['да', 'yes', 'y', 'д']:
            session = None
            try:
                # Используем сессию напрямую для надежного управления
                async with SessionLocal() as session:
                    repo = HackathonsRepo(session)
                    
                    # Подготавливаем данные
                    hackathon_data = context.user_data.copy()
                    
                    # Парсим даты
                    hackathon_data['start_date'] = self._parse_date(hackathon_data['start_date'])
                    hackathon_data['end_date'] = self._parse_date(hackathon_data['end_date'])
                    if hackathon_data.get('registration_end_date'):
                        hackathon_data['registration_end_date'] = self._parse_date(hackathon_data['registration_end_date'])
                    
                    # Создаем хакатон асинхронно
                    hackathon = await repo.create_hackathon(hackathon_data)
                    
                    # Явно коммитим транзакцию
                    await session.commit()
                    
                    await update.message.reply_text(
                        f"🎉 Хакатон '{hackathon.name}' успешно добавлен в базу данных!\n"
                        f"ID: {hackathon.id}",
                        reply_markup=ReplyKeyboardRemove()
                    )
                
            except Exception as e:
                logger.error(f"Ошибка при добавлении хакатона: {e}", exc_info=True)
                if session:
                    await session.rollback()
                await update.message.reply_text(
                    f"❌ Ошибка при добавлении хакатона: {str(e)}",
                    reply_markup=ReplyKeyboardRemove()
                )
            
            return ConversationHandler.END
        else:
            await update.message.reply_text(
                "❌ Добавление хакатона отменено.",
                reply_markup=ReplyKeyboardRemove()
            )
            return ConversationHandler.END
    
    async def list_hackathons(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Список всех хакатонов"""
        try:
            # Используем сессию напрямую для надежного управления
            async with SessionLocal() as session:
                repo = HackathonsRepo(session)
                hackathons = await repo.get_all_hackathons()
                
                if not hackathons:
                    await update.message.reply_text("📭 В базе данных нет хакатонов.")
                else:
                    response = "📋 Список всех хакатонов:\n\n"
                    
                    for hackathon in hackathons:
                        response += (
                            f"🏷️ {hackathon.name}\n"
                            f"🆔 ID: {hackathon.id}\n"
                            f"📅 {hackathon.start_date.strftime('%d.%m.%Y')} - {hackathon.end_date.strftime('%d.%m.%Y')}\n"
                            f"🌐 {hackathon.mode} | 🏙️ {hackathon.city or 'Онлайн'}\n"
                            f"👥 {hackathon.team_members_minimum}-{hackathon.team_members_limit} чел.\n"
                            f"💰 {hackathon.prize_fund}\n"
                            f"📊 Статус: {hackathon.status}\n"
                            f"{'-' * 30}\n"
                        )
                    
                    # Разбиваем на части если сообщение слишком длинное
                    if len(response) > 4096:
                        parts = [response[i:i+4096] for i in range(0, len(response), 4096)]
                        for part in parts:
                            await update.message.reply_text(part)
                    else:
                        await update.message.reply_text(response)
                    
        except Exception as e:
            logger.error(f"Ошибка при получении списка хакатонов: {e}", exc_info=True)
            await update.message.reply_text(f"❌ Ошибка при получении списка хакатонов: {str(e)}")
    
    async def cancel(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
        """Отмена операции"""
        await update.message.reply_text(
            '❌ Операция отменена.',
            reply_markup=ReplyKeyboardRemove()
        )
        return ConversationHandler.END
    
    async def unknown(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обработка неизвестных команд"""
        await update.message.reply_text(
            "❌ Неизвестная команда. Используйте /help для просмотра доступных команд."
        )
    
    def setup_handlers(self):
        """Настройка обработчиков"""
        # Обработчик диалога добавления хакатона
        conv_handler = ConversationHandler(
            entry_points=[CommandHandler('add_hackathon', self.add_hackathon)],
            states={
                HACK_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_name)],
                HACK_DESCRIPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_description)],
                HACK_IMAGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_image)],
                HACK_START_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_start_date)],
                HACK_END_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_end_date)],
                HACK_REG_END_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_reg_end_date)],
                HACK_MODE: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_mode)],
                HACK_CITY: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_city)],
                HACK_MIN_MEMBERS: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_min_members)],
                HACK_MAX_MEMBERS: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_max_members)],
                HACK_REG_LINK: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_reg_link)],
                HACK_PRIZE: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_prize)],
                HACK_STATUS: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.hackathon_status)],
                CONFIRMATION: [MessageHandler(filters.TEXT & ~filters.COMMAND, self.confirmation)],
            },
            fallbacks=[CommandHandler('cancel', self.cancel)],
        )
        
        # Добавляем обработчики
        # ВАЖНО: Сначала добавляем специфичные команды, потом общий обработчик неизвестных команд
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("list_hackathons", self.list_hackathons))
        self.application.add_handler(conv_handler)
        # Обработчик неизвестных команд должен быть последним
        self.application.add_handler(MessageHandler(filters.COMMAND, self.unknown))
    
    async def init_db(self):
        """Инициализация базы данных - проверяем подключение"""
        # Проверяем подключение к БД (таблицы должны быть созданы через SQL скрипты)
        try:
            from backend.infrastructure.db import init_db, get_engine
            from backend.settings.config import settings
            # Логируем настройки подключения (без пароля)
            logger.info(f"🔌 Попытка подключения к БД: {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")
            await init_db()
            logger.info("✅ Подключение к базе данных успешно установлено")
            await self._ensure_seed_data(get_engine())
        except Exception as e:
            logger.warning(f"⚠️ Не удалось подключиться к БД при инициализации: {e}")
            logger.warning("Бот будет работать, но операции с БД могут не выполняться")
            logger.warning("💡 Убедитесь, что PostgreSQL запущен и настройки в .env правильные")
    
    async def _ensure_seed_data(self, engine):
        """Заполняет таблицу хакатонов начальными данными, если она пуста."""
        seed_path = Path(project_root) / "initdb_db" / "06_seed_mocks.sql"

        if not seed_path.exists():
            logger.warning(f"⚠️ Seed файл не найден: {seed_path}")
            return

        try:
            async with engine.begin() as conn:
                check_result = await conn.execute(
                    text("SELECT 1 FROM hackathon WHERE name = :seed_name LIMIT 1"),
                    {"seed_name": "МосТех Хак 2026"}
                )

                if check_result.first():
                    logger.info("📦 Seed данные уже присутствуют в таблице hackathon — загрузка пропущена")
                    return

                seed_sql = seed_path.read_text(encoding="utf-8")
                await conn.execute(text(seed_sql))
                logger.info("🌱 Seed данные из 06_seed_mocks.sql загружены в таблицу hackathon")
        except Exception as seed_error:
            logger.error(f"❌ Не удалось загрузить seed данные: {seed_error}", exc_info=True)

    async def setup_bot_commands(self):
        """Устанавливает список команд Telegram для быстрого доступа."""
        if not self.application or not self.application.bot:
            return

        commands = [
            BotCommand("start", "Запуск и основные команды"),
            BotCommand("help", "Подсказка по использованию бота"),
            BotCommand("list_hackathons", "Список всех хакатонов"),
            BotCommand("add_hackathon", "Добавить новый хакатон"),
            BotCommand("cancel", "Отменить текущую операцию"),
        ]

        try:
            await self.application.bot.set_my_commands(commands)
            logger.info("✅ Команды бота зарегистрированы")
        except Exception as e:
            logger.warning(f"⚠️ Не удалось зарегистрировать команды бота: {e}")

    def run(self):
        """Запуск бота"""
        # Создаем асинхронное приложение
        self.application = Application.builder().token(self.token).build()
        self.setup_handlers()
        
        # Запускаем инициализацию БД в новом event loop
        async def startup():
            await self.init_db()
            await self.setup_bot_commands()
        
        # Создаем новый event loop и запускаем инициализацию
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        loop.run_until_complete(startup())
        
        logger.info("Бот для управления хакатонами запущен...")
        logger.info("Попытка подключения к Telegram API...")
        try:
            self.application.run_polling(
                allowed_updates=Update.ALL_TYPES,
                drop_pending_updates=True
            )
        except Exception as e:
            logger.error(f"Ошибка при запуске бота: {e}")
            logger.error("Проверьте:")
            logger.error("1. Интернет-соединение")
            logger.error("2. Правильность токена бота (TELEGRAM_BOT_TOKEN)")
            logger.error("3. Доступность Telegram API (возможно, требуется прокси)")
            raise

def main():
    """Точка входа"""
    bot = HackathonBot()
    bot.run()


if __name__ == '__main__':
    main()