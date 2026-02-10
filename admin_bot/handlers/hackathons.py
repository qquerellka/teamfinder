from __future__ import annotations

from datetime import datetime

from aiogram import Router, F
from aiogram.filters import Command, StateFilter
from aiogram.types import (
    Message,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    CallbackQuery,
)
from aiogram.fsm.context import FSMContext

from config import settings
from states import HackathonForm, DeleteHackathonForm
from services.api_client import create_hackathon, delete_hackathon

router = Router()

DATE_FORMAT = "%d.%m.%Y"
ALLOWED_MODES = ("online", "offline", "hybrid")


def _is_admin(user_id: int) -> bool:
    return user_id in settings.admin_ids


def _parse_date(text: str) -> datetime | None:
    """Парсит дату в формате dd.mm.yyyy. Возвращает None, если формат неверный."""
    try:
        return datetime.strptime(text, DATE_FORMAT)
    except ValueError:
        return None


# ===== Старт =====


@router.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "Привет! Я админ-бот Teamfinder.\n\n"
        "Сейчас умею:\n"
        "• /addhackathon — добавить хакатон на платформу.\n"
        "• /deletehackathon — удалить хакатон по ID.\n"
    )


# ===== Добавление хакатона =====


@router.message(Command("addhackathon"))
async def cmd_add_hackathon(message: Message, state: FSMContext):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return

    await state.set_state(HackathonForm.name)
    await message.answer("📝 Введи <b>название хакатона</b>:")


@router.message(HackathonForm.name)
async def form_name(message: Message, state: FSMContext):
    await state.update_data(name=(message.text or "").strip())
    await state.set_state(HackathonForm.description)
    await message.answer(
        "✏️ Введи <b>краткое описание</b> хакатона (можно в одну-две строки):"
    )


@router.message(HackathonForm.description)
async def form_description(message: Message, state: FSMContext):
    await state.update_data(description=(message.text or "").strip())
    await state.set_state(HackathonForm.start_date)
    await message.answer(
        "📅 Введи <b>дату начала</b> в формате <code>dd.mm.yyyy</code> "
        "(например, 10.01.2025):"
    )


@router.message(HackathonForm.start_date)
async def form_start_date(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    start_dt = _parse_date(text)
    if not start_dt:
        await message.answer(
            "❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code> "
            "(например, 10.01.2025)."
        )
        return

    data = await state.get_data()

    # если уже есть end_date в стейте – проверяем
    end_date_str = data.get("end_date")
    if end_date_str:
        end_dt = _parse_date(end_date_str)
        if end_dt and start_dt > end_dt:
            await message.answer(
                "❌ Дата начала не может быть позже даты окончания. Попробуй ещё раз:"
            )
            return

    # если уже есть registration_end_date – проверяем
    registration_end = data.get("registration_end_date")
    if registration_end:
        reg_dt = _parse_date(registration_end)
        if reg_dt and reg_dt > start_dt:
            await message.answer(
                "❌ Дедлайн регистрации не может быть позже даты начала. "
                "Попробуй ещё раз:"
            )
            return

    await state.update_data(start_date=text)
    await state.set_state(HackathonForm.end_date)
    await message.answer(
        "📅 Введи <b>дату окончания</b> в формате <code>dd.mm.yyyy</code>:"
    )


@router.message(HackathonForm.end_date)
async def form_end_date(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    end_dt = _parse_date(text)
    if not end_dt:
        await message.answer(
            "❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code> "
            "(например, 15.01.2025)."
        )
        return

    data = await state.get_data()
    start_date_str = data.get("start_date")
    if not start_date_str:
        await message.answer("❌ Сначала укажи дату начала.")
        return

    start_dt = _parse_date(start_date_str)
    if start_dt and end_dt < start_dt:
        await message.answer(
            "❌ Дата окончания не может быть раньше даты начала. Попробуй ещё раз:"
        )
        return

    await state.update_data(end_date=text)
    await state.set_state(HackathonForm.registration_end_date)
    await message.answer(
        "📅 Введи <b>дедлайн регистрации</b> в формате <code>dd.mm.yyyy</code>\n"
        "или отправь <code>-</code>, если дедлайна нет:"
    )


@router.message(HackathonForm.registration_end_date)
async def form_registration_end_date(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    data = await state.get_data()
    start_date_str = data.get("start_date")

    if not start_date_str:
        await message.answer("❌ Сначала укажи дату начала.")
        return

    start_dt = _parse_date(start_date_str)

    if text == "-":
        reg_end = None
    else:
        reg_end_dt = _parse_date(text)
        if not reg_end_dt:
            await message.answer(
                "❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code> "
                "или <code>-</code>."
            )
            return

        if start_dt and reg_end_dt > start_dt:
            await message.answer(
                "❌ Дедлайн регистрации не может быть позже даты начала. "
                "Попробуй ещё раз:"
            )
            return

        reg_end = text

    await state.update_data(registration_end_date=reg_end)
    await state.set_state(HackathonForm.mode)

    # Создаем inline клавиатуру
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🌐 Online", callback_data="mode_online"),
                InlineKeyboardButton(text="🏢 Offline", callback_data="mode_offline"),
            ],
            [
                InlineKeyboardButton(text="🔀 Hybrid", callback_data="mode_hybrid"),
            ],
        ]
    )

    await message.answer("🌐 Выбери <b>формат</b> хакатона:", reply_markup=keyboard)


# ===== Обработчик выбора mode =====


@router.callback_query(F.data.startswith("mode_"))
async def process_mode_selection(callback: CallbackQuery, state: FSMContext):
    # Извлекаем тип из callback_data
    mode_type = callback.data.replace("mode_", "")

    if mode_type not in ALLOWED_MODES:
        await callback.answer("Неверный формат")
        return

    # Обновляем состояние
    await state.update_data(mode=mode_type)

    # Отвечаем на callback
    await callback.answer(f"Выбран формат: {mode_type}")

    # Удаляем клавиатуру
    await callback.message.edit_reply_markup(reply_markup=None)

    # Показываем пользователю выбранный вариант
    mode_texts = {"online": "🌐 Online", "offline": "🏢 Offline", "hybrid": "🔀 Hybrid"}

    await callback.message.answer(f"✅ Формат: <b>{mode_texts[mode_type]}</b>")

    # Продолжаем в зависимости от выбранного формата
    if mode_type == "online":
        # для онлайн-события город фиксируем как "online"
        await state.update_data(city="online")
        await state.set_state(HackathonForm.team_min)
        await callback.message.answer(
            "👥 Введи <b>минимальное число участников в команде</b> "
            "(целое число, можно пропустить, отправив <code>-</code>):"
        )
    else:
        await state.set_state(HackathonForm.city)
        await callback.message.answer("🏙 Введи <b>город</b> проведения:")


@router.message(HackathonForm.city)
async def form_city(message: Message, state: FSMContext):
    await state.update_data(city=(message.text or "").strip())
    await state.set_state(HackathonForm.team_min)
    await message.answer(
        "👥 Введи <b>минимальное число участников в команде</b> "
        "(целое число, можно пропустить, отправив <code>-</code>):"
    )


@router.message(HackathonForm.team_min)
async def form_team_min(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    data = await state.get_data()

    if text == "-":
        team_min = None
    else:
        try:
            team_min = int(text)
        except ValueError:
            await message.answer(
                "❌ Введите корректное число для минимального количества участников "
                "или '-'."
            )
            return

        if not (1 <= team_min <= 20):
            await message.answer(
                "❌ Минимальное количество участников должно быть от 1 до 20 или '-'."
            )
            return

    team_max = data.get("team_members_limit")
    if team_min is not None and team_max is not None and team_min > team_max:
        await message.answer(
            "❌ Минимальное количество участников не может быть больше максимального."
        )
        return

    await state.update_data(team_members_minimum=team_min)
    await state.set_state(HackathonForm.team_max)
    await message.answer(
        "👥 Введи <b>максимальное</b> количество участников в команде "
        "(от 1 до 20, можно пропустить, отправив <code>-</code>):"
    )


@router.message(HackathonForm.team_max)
async def form_team_max(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    data = await state.get_data()

    if text == "-":
        team_max = None
    else:
        try:
            team_max = int(text)
        except ValueError:
            await message.answer(
                "❌ Введите корректное число для максимального количества участников "
                "или '-'."
            )
            return

        if not (1 <= team_max <= 20):
            await message.answer(
                "❌ Максимальное количество участников должно быть от 1 до 20 или '-'."
            )
            return

    team_min = data.get("team_members_minimum")
    if team_min is not None and team_max is not None and team_max < team_min:
        await message.answer(
            "❌ Максимальное количество участников не может быть меньше минимального."
        )
        return

    await state.update_data(team_members_limit=team_max)
    await state.set_state(HackathonForm.registration_link)
    await message.answer(
        "🔗 Введи <b>ссылку на регистрацию</b> " "(или <code>-</code>, если пока нет):"
    )


@router.message(HackathonForm.registration_link)
async def form_registration_link(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    link = None if text == "-" else text
    await state.update_data(registration_link=link)
    await state.set_state(HackathonForm.prize_fund)
    await message.answer(
        "💰 Введи <b>призовой фонд</b> (0 если призовых нет):"
    )


@router.message(HackathonForm.prize_fund)
async def form_prize_fund(message: Message, state: FSMContext):
    text = (message.text or "").strip()

    if text == "-":
        prize = None
    else:
        # сохраняем строку как число — бэкенд ждёт Optional[int]
        prize = int(text)

    await state.update_data(prize_fund=prize)
    await state.set_state(HackathonForm.image_link)
    await message.answer(
        "🖼 Отправь <b>картинку для хакатона</b> "
        "(или <code>-</code>, чтобы пропустить):"
    )


@router.message(HackathonForm.image_link)
async def form_image_link(message: Message, state: FSMContext):
    image_file_id: str | None = None

    if message.photo:
        # Берём самую большую по размеру картинку
        image_file_id = message.photo[-1].file_id
    elif message.text and message.text.strip() == "-":
        image_file_id = None
    else:
        await message.answer(
            "❌ Отправь картинку или <code>-</code>, чтобы пропустить."
        )
        return

    await state.update_data(image_file_id=image_file_id)
    data = await state.get_data()

    preview = (
        f"<b>Проверь данные хакатона:</b>\n"
        f"• Название: {data['name']}\n"
        f"• Описание: {data['description']}\n"
        f"• Даты: {data['start_date']} — {data['end_date']}\n"
        f"• Дедлайн регистрации: {data.get('registration_end_date') or '—'}\n"
        f"• Город: {data['city']}\n"
        f"• Формат: {data['mode']}\n"
        f"• Команда: "
        f"{data.get('team_members_minimum') or '—'}–"
        f"{data.get('team_members_limit') or '—'} чел.\n"
        f"• Рег. ссылка: {data.get('registration_link') or '—'}\n"
        f"• Призовой фонд: {data.get('prize_fund') or '—'}\n"
        f"• Картинка: {'Есть' if data.get('image_file_id') else '—'}\n\n"
        f"Если всё ок — отправь <code>да</code>, "
        f"иначе отправь что угодно для отмены."
    )

    await state.set_state(HackathonForm.confirm)
    await message.answer(preview)

    if image_file_id:
        await message.answer_photo(image_file_id)


@router.message(HackathonForm.confirm)
async def form_confirm(message: Message, state: FSMContext):
    text = (message.text or "").strip().lower()
    if text not in ("да", "yes", "y", "ok", "ок"):
        await state.clear()
        await message.answer("❌ Создание хакатона отменено.")
        return

    data = await state.get_data()
    await state.clear()

    payload = {
        "name": data["name"],
        "description": data["description"],
        "image_file_id": data.get("image_file_id"),
        "start_date": data["start_date"],
        "end_date": data["end_date"],
        "registration_end_date": data.get("registration_end_date"),
        "mode": data["mode"],
        "status": "open",
        "city": data["city"],
        "team_members_minimum": data.get("team_members_minimum"),
        "team_members_limit": data.get("team_members_limit"),
        "registration_link": data.get("registration_link"),
        "prize_fund": data.get("prize_fund"),
    }

    try:
        created = await create_hackathon(payload)
    except Exception as e:
        await message.answer(f"⚠️ Ошибка при создании хакатона: <code>{e}</code>")
        return

    await message.answer(
        "✅ Хакатон успешно создан!\n\n"
        f"id: <code>{created.get('id')}</code>\n"
        f"Название: <b>{created.get('name')}</b>"
    )


# ===== Удаление хакатона =====


@router.message(Command("deletehackathon"))
async def cmd_delete_hackathon(message: Message, state: FSMContext):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return

    await state.set_state(DeleteHackathonForm.hackathon_id)
    await message.answer(
        "🗑 Введи <b>ID хакатона</b>, который нужно удалить:\n"
        "(ID можно посмотреть в карточке созданного хакатона)"
    )


@router.message(DeleteHackathonForm.hackathon_id)
async def delete_form_hackathon_id(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    
    try:
        hackathon_id = int(text)
        if hackathon_id <= 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ ID хакатона должен быть положительным целым числом.")
        return

    # Создаем inline клавиатуру для подтверждения
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Да, удалить", 
                    callback_data=f"confirm_delete_{hackathon_id}"
                ),
                InlineKeyboardButton(
                    text="❌ Отмена", 
                    callback_data="cancel_delete"
                ),
            ]
        ]
    )

    await state.update_data(hackathon_id=hackathon_id)
    await message.answer(
        f"⚠️ <b>ВНИМАНИЕ!</b> Ты собираешься удалить хакатон с ID <code>{hackathon_id}</code>.\n\n"
        f"Это действие <b>необратимо</b>. Все данные о хакатоне будут удалены.\n\n"
        f"Подтверди удаление:",
        reply_markup=keyboard
    )


@router.callback_query(F.data.startswith("confirm_delete_"))
async def confirm_delete_hackathon(callback: CallbackQuery, state: FSMContext):
    try:
        # Извлекаем ID из callback_data
        hackathon_id = int(callback.data.replace("confirm_delete_", ""))
    except ValueError:
        await callback.answer("❌ Неверный формат ID")
        return

    # Удаляем клавиатуру
    await callback.message.edit_reply_markup(reply_markup=None)

    try:
        # Вызываем API для удаления
        success = await delete_hackathon(hackathon_id)
        
        if success:
            await callback.message.answer(
                f"✅ Хакатон с ID <code>{hackathon_id}</code> успешно удалён."
            )
        else:
            await callback.message.answer(
                f"❌ Не удалось удалить хакатон с ID <code>{hackathon_id}</code>.\n"
                f"Возможно, хакатон не существует или произошла ошибка на сервере."
            )
    except Exception as e:
        await callback.message.answer(
            f"⚠️ Ошибка при удалении хакатона: <code>{e}</code>"
        )
    
    await state.clear()
    await callback.answer()


@router.callback_query(F.data == "cancel_delete")
async def cancel_delete_hackathon(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.message.edit_reply_markup(reply_markup=None)
    await callback.message.answer("❌ Удаление хакатона отменено.")
    await callback.answer()