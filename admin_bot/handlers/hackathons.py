# admin_bot/handlers/hackathons.py
from __future__ import annotations

from datetime import datetime

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext

from admin_bot.config import settings
from admin_bot.states import HackathonForm
from admin_bot.services.api_client import create_hackathon

router = Router()

DATE_FORMAT = "%d.%m.%Y"


def _is_admin(user_id: int) -> bool:
    return user_id in settings.admin_ids


def _parse_date(text: str) -> datetime | None:
    """Парсит дату в формате dd.mm.yyyy. Возвращает None, если формат неверный."""
    try:
        return datetime.strptime(text, DATE_FORMAT)
    except ValueError:
        return None


# ----- Стартовая команда -----


@router.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "Привет! Я админ-бот Teamfinder.\n\n"
        "Сейчас умею:\n"
        "• /addhackathon — добавить хакатон на платформу.\n"
    )


# ----- Добавление хакатона -----


@router.message(Command("addhackathon"))
async def cmd_add_hackathon(message: Message, state: FSMContext):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return

    await state.set_state(HackathonForm.name)
    await message.answer("📝 Введи <b>название хакатона</b>:")


@router.message(HackathonForm.name)
async def form_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text.strip())
    await state.set_state(HackathonForm.description)
    await message.answer("✏️ Введи <b>краткое описание</b> хакатона (можно в одну-две строки):")


@router.message(HackathonForm.description)
async def form_description(message: Message, state: FSMContext):
    await state.update_data(description=message.text.strip())
    await state.set_state(HackathonForm.start_date)
    await message.answer("📅 Введи <b>дату начала</b> в формате <code>dd.mm.yyyy</code> (например, 10.01.2025):")


@router.message(HackathonForm.start_date)
async def form_start_date(message: Message, state: FSMContext):
    text = message.text.strip()
    start_dt = _parse_date(text)
    if not start_dt:
        await message.answer("❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code> (например, 10.01.2025).")
        return
    
    # Проверяем, что дата начала не позже уже введённой даты окончания (если есть)
    data = await state.get_data()
    end_date = data.get("end_date")
    if end_date:
        end_dt = _parse_date(end_date)
        if end_dt and start_dt > end_dt:
            await message.answer("❌ Дата начала не может быть позже даты окончания. Попробуй ещё раз:")
            return
    
    # Проверяем, что дата начала не раньше уже введённого дедлайна регистрации (если есть)
    registration_end = data.get("registration_end_date")
    if registration_end and registration_end != "-":
        reg_dt = _parse_date(registration_end)
        if reg_dt and reg_dt > start_dt:
            await message.answer("❌ Дедлайн регистрации не может быть позже даты начала. Попробуй ещё раз:")
            return
    
    await state.update_data(start_date=text)
    await state.set_state(HackathonForm.end_date)
    await message.answer("📅 Введи <b>дату окончания</b> в формате <code>dd.mm.yyyy</code>:")

@router.message(HackathonForm.end_date)
async def form_end_date(message: Message, state: FSMContext):
    text = message.text.strip()
    end_dt = _parse_date(text)
    if not end_dt:
        await message.answer("❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code> (например, 15.01.2025).")
        return
    
    # Проверяем, что дата окончания не раньше даты начала
    data = await state.get_data()
    start_date = data.get("start_date")
    if not start_date:
        await message.answer("❌ Сначала укажи дату начала.")
        return
    
    start_dt = _parse_date(start_date)
    if start_dt and end_dt < start_dt:
        await message.answer("❌ Дата окончания не может быть раньше даты начала. Попробуй ещё раз:")
        return
    
    await state.update_data(end_date=text)
    await state.set_state(HackathonForm.registration_end_date)
    await message.answer(
        "📅 Введи <b>дедлайн регистрации</b> в формате <code>dd.mm.yyyy</code>\n"
        "или отправь <code>-</code>, если дедлайна нет:"
    )


@router.message(HackathonForm.registration_end_date)
async def form_registration_end_date(message: Message, state: FSMContext):
    text = message.text.strip()
    data = await state.get_data()
    start_date = data.get("start_date")
    
    if not start_date:
        await message.answer("❌ Сначала укажи дату начала.")
        return
    
    start_dt = _parse_date(start_date)
    
    if text == "-":
        reg_end = None
    else:
        reg_end_dt = _parse_date(text)
        if not reg_end_dt:
            await message.answer("❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code> или <code>-</code>.")
            return
        
        # Проверяем, что дедлайн регистрации не позже даты начала
        if start_dt and reg_end_dt > start_dt:
            await message.answer("❌ Дедлайн регистрации не может быть позже даты начала. Попробуй ещё раз:")
            return
        
        reg_end = text
    
    await state.update_data(registration_end_date=reg_end)
    await state.set_state(HackathonForm.city)
    await message.answer("🏙 Введи <b>город</b> проведения (или <code>online</code>):")


@router.message(HackathonForm.city)
async def form_city(message: Message, state: FSMContext):
    await state.update_data(city=message.text.strip())
    await state.set_state(HackathonForm.mode)
    await message.answer("🌐 Введи <b>формат</b> хакатона: <code>online</code>, <code>offline</code> или <code>hybrid</code>:")


@router.message(HackathonForm.mode)
async def form_mode(message: Message, state: FSMContext):
    await state.update_data(mode=message.text.strip())
    await state.set_state(HackathonForm.team_min)
    await message.answer(
        "👥 Введи <b>минимальное число участников в команде</b> "
        "(целое число, можно пропустить, отправив <code>-</code>):"
    )


@router.message(HackathonForm.team_min)
async def form_team_min(message: Message, state: FSMContext):
    text = message.text.strip()
    if text == "-":
        team_min = None
    else:
        try:
            team_min = int(text)
        except ValueError:
            await message.answer("❌ Нужно ввести целое число или <code>-</code>. Попробуй ещё раз:")
            return
    await state.update_data(team_members_minimum=team_min)
    await state.set_state(HackathonForm.team_max)
    await message.answer(
        "👥 Введи <b>максимальное число участников в команде</b> "
        "(целое число, можно пропустить, отправив <code>-</code>):"
    )
@router.message(HackathonForm.team_max)
async def form_team_max(message: Message, state: FSMContext):
    text = message.text.strip()
    if text == "-":
        team_max = None
    else:
        try:
            team_max = int(text)
        except ValueError:
            await message.answer("❌ Нужно ввести целое число или <code>-</code>. Попробуй ещё раз:")
            return
    await state.update_data(team_members_limit=team_max)
    await state.set_state(HackathonForm.registration_link)
    await message.answer(
        "🔗 Введи <b>ссылку на регистрацию</b> (или <code>-</code>, если пока нет):"
    )


@router.message(HackathonForm.registration_link)
async def form_registration_link(message: Message, state: FSMContext):
    text = message.text.strip()
    link = None if text == "-" else text
    await state.update_data(registration_link=link)
    await state.set_state(HackathonForm.prize_fund)
    await message.answer(
        "💰 Введи <b>призовой фонд</b> (например, <code>1 000 000 ₽</code> или <code>-</code>, если не указывать):"
    )


@router.message(HackathonForm.prize_fund)
async def form_prize_fund(message: Message, state: FSMContext):
    text = message.text.strip()
    prize = None if text == "-" else text
    await state.update_data(prize_fund=prize)

    data = await state.get_data()

    # Превью перед отправкой
    preview = (
        f"<b>Проверь данные хакатона:</b>\n"
        f"• Название: {data['name']}\n"
        f"• Описание: {data['description']}\n"
        f"• Даты: {data['start_date']} — {data['end_date']}\n"
        f"• Дедлайн регистрации: {data.get('registration_end_date') or '—'}\n"
        f"• Город: {data['city']}\n"
        f"• Формат: {data['mode']}\n"
        f"• Команда: {data.get('team_members_minimum') or '—'}–{data.get('team_members_limit') or '—'} чел.\n"
        f"• Рег. ссылка: {data.get('registration_link') or '—'}\n"
        f"• Призовой фонд: {data.get('prize_fund') or '—'}\n\n"
        f"Если всё ок — отправь <code>да</code>, иначе отправь что угодно для отмены."
    )

    await state.set_state(HackathonForm.confirm)
    await message.answer(preview)


@router.message(HackathonForm.confirm)
async def form_confirm(message: Message, state: FSMContext):
    text = (message.text or "").strip().lower()
    if text not in ("да", "yes", "y", "ok", "ок"):
        await state.clear()
        await message.answer("❌ Создание хакатона отменено.")
        return

    data = await state.get_data()
    await state.clear()

    # Собираем payload под твоё API.
    payload = {
        "name": data["name"],
        "description": data["description"],
        "image_link": None,  # можно потом добавить шаг под картинку
        "start_date": data["start_date"],  # dd.mm.yyyy
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