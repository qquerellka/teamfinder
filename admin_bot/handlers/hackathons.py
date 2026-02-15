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
from states import HackathonForm, DeleteHackathonForm, UpdateHackathonForm
from services.api_client import (
    create_hackathon,
    delete_hackathon,
    get_hackathon,
    list_hackathons,
    update_hackathon,
)

router = Router()

DATE_FORMAT = "%d.%m.%Y"
ALLOWED_MODES = ("online", "offline", "hybrid")

ALLOWED_TRACKS = ("ctf", "ml", "product", "algo", "case", "game")

TRACK_LABELS = {
    "ctf": "CTF",
    "ml": "ML",
    "product": "Product",
    "algo": "Algo",
    "case": "Case",
    "game": "Game",
}

LIST_PAGE_SIZE = 5

STATUS_LABELS = {
    "open": "🟢 Open",
    "closed": "🔴 Closed",
    "all": "⚪ All",
}


def _main_menu_keyboard() -> InlineKeyboardMarkup:
    rows = [
        [
            InlineKeyboardButton(text="➕ Добавить", callback_data="menu_add"),
            InlineKeyboardButton(text="📋 Список", callback_data="menu_list"),
        ],
        [
            InlineKeyboardButton(text="✏️ Обновить", callback_data="menu_update"),
            InlineKeyboardButton(text="🗑 Удалить", callback_data="menu_delete"),
        ],
        [
            InlineKeyboardButton(text="ℹ️ Помощь", callback_data="menu_help"),
        ],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)

def _tracks_keyboard(selected: set[str]) -> InlineKeyboardMarkup:
    rows = []
    for t in ALLOWED_TRACKS:
        mark = "✅ " if t in selected else ""
        rows.append([InlineKeyboardButton(text=f"{mark}{TRACK_LABELS[t]}", callback_data=f"track_{t}")])

    rows.append([
        InlineKeyboardButton(text="✅ Готово", callback_data="tracks_done"),
        InlineKeyboardButton(text="🧹 Очистить", callback_data="tracks_clear"),
    ])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _tracks_keyboard_update(selected: set[str]) -> InlineKeyboardMarkup:
    rows = []
    for t in ALLOWED_TRACKS:
        mark = "✅ " if t in selected else ""
        rows.append([
            InlineKeyboardButton(
                text=f"{mark}{TRACK_LABELS[t]}",
                callback_data=f"upd_track_{t}",
            )
        ])

    rows.append([
        InlineKeyboardButton(text="✅ Готово", callback_data="upd_tracks_done"),
        InlineKeyboardButton(text="🧹 Очистить", callback_data="upd_tracks_clear"),
    ])
    rows.append([InlineKeyboardButton(text="↩️ Назад", callback_data="upd_tracks_back")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _update_menu_keyboard() -> InlineKeyboardMarkup:
    rows = [
        [
            InlineKeyboardButton(text="Название", callback_data="upd_field:name"),
            InlineKeyboardButton(text="Описание", callback_data="upd_field:description"),
        ],
        [
            InlineKeyboardButton(text="Даты", callback_data="upd_field:dates"),
            InlineKeyboardButton(
                text="Дедлайн рег.", callback_data="upd_field:registration_end_date"
            ),
        ],
        [
            InlineKeyboardButton(text="Формат", callback_data="upd_field:mode"),
            InlineKeyboardButton(text="Статус", callback_data="upd_field:status"),
        ],
        [
            InlineKeyboardButton(text="Город", callback_data="upd_field:city"),
            InlineKeyboardButton(text="Треки", callback_data="upd_field:tracks"),
        ],
        [
            InlineKeyboardButton(text="Команда", callback_data="upd_field:team"),
            InlineKeyboardButton(
                text="Ссылка", callback_data="upd_field:registration_link"
            ),
        ],
        [
            InlineKeyboardButton(
                text="Призовой фонд", callback_data="upd_field:prize_fund"
            ),
        ],
        [
            InlineKeyboardButton(text="✅ Сохранить", callback_data="upd_save"),
            InlineKeyboardButton(text="❌ Отмена", callback_data="upd_cancel"),
        ],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)

def _is_admin(user_id: int) -> bool:
    return user_id in settings.admin_ids


def _parse_date(text: str) -> datetime | None:
    """Парсит дату в формате dd.mm.yyyy. Возвращает None, если формат неверный."""
    try:
        return datetime.strptime(text, DATE_FORMAT)
    except ValueError:
        return None


def _track_label(track: str) -> str:
    return TRACK_LABELS.get(track, track)


def _format_hackathon_short(h: dict) -> str:
    tracks = ", ".join(_track_label(t) for t in (h.get("tracks") or [])) or "—"
    city = h.get("city") or "—"
    status = STATUS_LABELS.get(h.get("status"), h.get("status"))
    return (
        f"#{h.get('id')} • <b>{h.get('name')}</b>\n"
        f"📅 {h.get('start_date')} — {h.get('end_date')}\n"
        f"🌐 {h.get('mode')} • 🏙 {city}\n"
        f"🏷 {tracks}\n"
        f"📌 {status}"
    )


def _format_hackathon_detail(h: dict) -> str:
    tracks = ", ".join(_track_label(t) for t in (h.get("tracks") or [])) or "—"
    team_min = h.get("team_members_minimum") or "—"
    team_max = h.get("team_members_limit") or "—"
    return (
        f"<b>Хакатон #{h.get('id')}</b>\n"
        f"• Название: {h.get('name')}\n"
        f"• Описание: {h.get('description') or '—'}\n"
        f"• Даты: {h.get('start_date')} — {h.get('end_date')}\n"
        f"• Дедлайн регистрации: {h.get('registration_end_date') or '—'}\n"
        f"• Формат: {h.get('mode')}\n"
        f"• Статус: {h.get('status')}\n"
        f"• Город: {h.get('city') or '—'}\n"
        f"• Треки: {tracks}\n"
        f"• Команда: {team_min}–{team_max} чел.\n"
        f"• Рег. ссылка: {h.get('registration_link') or '—'}\n"
        f"• Призовой фонд: {h.get('prize_fund') or '—'}"
    )


def _format_pending_updates(updates: dict) -> str:
    if not updates:
        return "— пока нет изменений"
    parts = []
    for key, value in updates.items():
        if key == "tracks":
            text = ", ".join(_track_label(t) for t in (value or [])) or "—"
        elif value is None:
            text = "— (очищено)"
        else:
            text = str(value)
        parts.append(f"• {key}: {text}")
    return "\n".join(parts)


def _format_api_error(error: Exception) -> str:
    text = str(error)
    lowered = text.lower()
    if "404" in lowered or "not found" in lowered:
        return "Не найдено. Проверь ID и попробуй снова."
    if "invalid date format" in lowered:
        return "Неверный формат даты. Используй dd.mm.yyyy."
    if "401" in lowered or "403" in lowered:
        return "Нет доступа. Проверь admin токен."
    return f"Ошибка: {text}"


def _list_keyboard(items: list[dict], offset: int, limit: int, status: str) -> InlineKeyboardMarkup:
    rows = []
    filter_row = []
    if status == "open":
        filter_row.append(InlineKeyboardButton(text="✅ Open", callback_data="noop"))
    else:
        filter_row.append(
            InlineKeyboardButton(text="🟢 Open", callback_data="list:open:0")
        )
    if status == "closed":
        filter_row.append(InlineKeyboardButton(text="✅ Closed", callback_data="noop"))
    else:
        filter_row.append(
            InlineKeyboardButton(text="🔴 Closed", callback_data="list:closed:0")
        )
    if status == "all":
        filter_row.append(InlineKeyboardButton(text="✅ All", callback_data="noop"))
    else:
        filter_row.append(
            InlineKeyboardButton(text="⚪ All", callback_data="list:all:0")
        )
    if filter_row:
        rows.append(filter_row)
    for item in items:
        hack_id = item.get("id")
        rows.append(
            [
                InlineKeyboardButton(text=f"🔎 #{hack_id}", callback_data=f"view:{hack_id}"),
                InlineKeyboardButton(text="✏️", callback_data=f"upd:{hack_id}"),
                InlineKeyboardButton(text="🗑", callback_data=f"del:{hack_id}"),
            ]
        )

    nav = []
    if offset > 0:
        nav.append(
            InlineKeyboardButton(
                text="⬅️ Назад", callback_data=f"list:{status}:{max(0, offset - limit)}"
            )
        )
    if len(items) == limit:
        nav.append(
            InlineKeyboardButton(
                text="Вперёд ➡️", callback_data=f"list:{status}:{offset + limit}"
            )
        )
    if nav:
        rows.append(nav)

    rows.append([InlineKeyboardButton(text="↩️ Меню", callback_data="menu_main")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _view_keyboard(hackathon_id: int) -> InlineKeyboardMarkup:
    rows = [
        [
            InlineKeyboardButton(text="✏️ Обновить", callback_data=f"upd:{hackathon_id}"),
            InlineKeyboardButton(text="🗑 Удалить", callback_data=f"del:{hackathon_id}"),
        ],
        [InlineKeyboardButton(text="📋 Список", callback_data="menu_list")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def _start_add_flow(message: Message, state: FSMContext) -> None:
    await state.set_state(HackathonForm.name)
    await message.answer("📝 Введи <b>название хакатона</b>:")


async def _start_delete_flow(message: Message, state: FSMContext) -> None:
    await state.set_state(DeleteHackathonForm.hackathon_id)
    await message.answer(
        "🗑 Введи <b>ID хакатона</b>, который нужно удалить:\n"
        "(ID можно посмотреть в карточке хакатона)"
    )


async def _send_delete_confirmation(
    message: Message, state: FSMContext, hackathon_id: int
) -> None:
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Да, удалить",
                    callback_data=f"confirm_delete_{hackathon_id}",
                ),
                InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_delete"),
            ]
        ]
    )

    await state.update_data(hackathon_id=hackathon_id)
    await message.answer(
        f"⚠️ <b>ВНИМАНИЕ!</b> Ты собираешься удалить хакатон с ID <code>{hackathon_id}</code>.\n\n"
        "Это действие <b>необратимо</b>. Все данные о хакатоне будут удалены.\n\n"
        "Подтверди удаление:",
        reply_markup=keyboard,
    )


async def _send_hackathon_list(
    message: Message, *, status: str = "all", offset: int = 0
) -> None:
    try:
        data = await list_hackathons(
            limit=LIST_PAGE_SIZE,
            offset=offset,
            status=status,
            all_status=(status == "all"),
        )
    except Exception as e:
        await message.answer(f"⚠️ {_format_api_error(e)}")
        return

    items = data.get("items") or []
    status_label = STATUS_LABELS.get(status, status)
    if not items:
        await message.answer(f"📋 Список хакатонов ({status_label}): пусто")
        return

    text = [f"📋 <b>Список хакатонов</b> ({status_label})"]
    for item in items:
        text.append("")
        text.append(_format_hackathon_short(item))

    await message.answer(
        "\n".join(text),
        reply_markup=_list_keyboard(items, offset, LIST_PAGE_SIZE, status),
    )


async def _start_update_flow(
    message: Message, state: FSMContext, hackathon_id: int
) -> None:
    try:
        current = await get_hackathon(hackathon_id)
    except Exception as e:
        await message.answer(f"⚠️ {_format_api_error(e)}")
        return

    await state.set_state(UpdateHackathonForm.menu)
    await state.update_data(hackathon_id=hackathon_id, current=current, updates={})
    await _send_update_menu(message, state)


async def _send_update_menu(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    current = data.get("current") or {}
    updates = data.get("updates") or {}
    text = (
        f"{_format_hackathon_detail(current)}\n\n"
        f"<b>Запланированные изменения:</b>\n{_format_pending_updates(updates)}"
    )
    await message.answer(text, reply_markup=_update_menu_keyboard())


def _effective_value(current: dict, updates: dict, key: str):
    if key in updates:
        return updates[key]
    return current.get(key)


# ===== Старт =====


@router.message(Command("start"))
async def cmd_start(message: Message):
    user_id = message.from_user.id

    if _is_admin(user_id):
        await message.answer(
            "✅ <b>Привет, администратор!</b>\n\n"
            "Я админ-бот Teamfinder. Ты можешь управлять хакатонами на платформе:\n\n"
            "📋 <b>Доступные команды:</b>\n"
            "• /addhackathon — добавить новый хакатон\n"
            "• /listhackathons — список хакатонов\n"
            "• /updatehackathon — обновить хакатон\n"
            "• /deletehackathon — удалить хакатон по ID\n"
            "• /menu — меню действий\n"
            "• /help — список всех команд\n\n"
            "Выбери действие из меню или введи команду."
            ,
            reply_markup=_main_menu_keyboard(),
        )
    else:
        await message.answer(
            "❌ <b>Вы не можете пользоваться функциями администратора</b>\n\n"
            # "Этот бот предназначен только для администраторов платформы Teamfinder.\n"
            # "У тебя нет прав для использования этого бота.\n\n"
            # "Если ты считаешь, что это ошибка, свяжись с разработчиками."
        )


@router.message(Command("help"))
async def cmd_help(message: Message):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return

    await message.answer(
        "📋 <b>Справка по командам админ-бота:</b>\n\n"
        "/start — перезапустить бота\n"
        "/menu — меню действий\n"
        "/addhackathon — добавить новый хакатон\n"
        "/listhackathons — список хакатонов (open/closed/all)\n"
        "/updatehackathon — обновить хакатон по ID\n"
        "/deletehackathon — удалить хакатон по ID\n"
        "/help — показать это сообщение\n\n"
        "<b>Процесс добавления хакатона:</b>\n"
        "1. Название и описание\n"
        "2. Даты проведения\n"
        "3. Дедлайн регистрации\n"
        "4. Формат и город\n"
        "5. Статус\n"
        "6. Размеры команд\n"
        "7. Ссылки и призовой фонд\n"
        "8. Изображение\n"
        "9. Подтверждение данных\n\n"
        "Все поля можно пропустить, отправив «-», кроме названия и дедлайна регистрации.\n"
        "Для офлайн/гибридного формата город обязателен."
    )


@router.message(Command("menu"))
async def cmd_menu(message: Message):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return
    await message.answer("⚙️ <b>Меню админа</b>", reply_markup=_main_menu_keyboard())


@router.callback_query(F.data == "menu_add")
async def menu_add(callback: CallbackQuery, state: FSMContext):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    await callback.answer()
    await _start_add_flow(callback.message, state)


@router.callback_query(F.data == "menu_list")
async def menu_list(callback: CallbackQuery):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    await callback.answer()
    await _send_hackathon_list(callback.message, status="all", offset=0)


@router.callback_query(F.data == "menu_update")
async def menu_update(callback: CallbackQuery, state: FSMContext):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    await callback.answer()
    await state.set_state(UpdateHackathonForm.hackathon_id)
    await callback.message.answer("✏️ Введи <b>ID хакатона</b> для обновления:")


@router.callback_query(F.data == "menu_delete")
async def menu_delete(callback: CallbackQuery, state: FSMContext):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    await callback.answer()
    await _start_delete_flow(callback.message, state)


@router.callback_query(F.data == "menu_help")
async def menu_help(callback: CallbackQuery):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    await callback.answer()
    await callback.message.answer(
        "ℹ️ Используй /help, чтобы увидеть все команды."
    )


@router.callback_query(F.data == "menu_main")
async def menu_main(callback: CallbackQuery):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    await callback.answer()
    await callback.message.answer("⚙️ <b>Меню админа</b>", reply_markup=_main_menu_keyboard())


# ===== Добавление хакатона =====


@router.message(Command("listhackathons"))
async def cmd_list_hackathons(message: Message):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return

    status = "all"
    parts = (message.text or "").split(maxsplit=1)
    if len(parts) > 1:
        candidate = parts[1].strip().lower()
        if candidate in STATUS_LABELS:
            status = candidate

    await _send_hackathon_list(message, status=status, offset=0)


@router.callback_query(F.data.startswith("list:"))
async def list_pagination(callback: CallbackQuery):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    try:
        _, status, offset_str = callback.data.split(":", 2)
        offset = int(offset_str)
    except ValueError:
        await callback.answer("Неверные параметры списка")
        return

    await callback.answer()
    await _send_hackathon_list(callback.message, status=status, offset=offset)


@router.callback_query(F.data == "noop")
async def noop_callback(callback: CallbackQuery):
    await callback.answer()


@router.callback_query(F.data.startswith("view:"))
async def view_hackathon(callback: CallbackQuery):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    try:
        hackathon_id = int(callback.data.split(":", 1)[1])
    except ValueError:
        await callback.answer("Неверный ID")
        return

    await callback.answer()
    try:
        h = await get_hackathon(hackathon_id)
    except Exception as e:
        await callback.message.answer(f"⚠️ {_format_api_error(e)}")
        return

    await callback.message.answer(
        _format_hackathon_detail(h),
        reply_markup=_view_keyboard(hackathon_id),
    )


@router.callback_query(F.data.startswith("del:"))
async def delete_from_list(callback: CallbackQuery, state: FSMContext):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    try:
        hackathon_id = int(callback.data.split(":", 1)[1])
    except ValueError:
        await callback.answer("Неверный ID")
        return

    await callback.answer()
    await _send_delete_confirmation(callback.message, state, hackathon_id)


@router.callback_query(F.data.startswith("upd:"))
async def update_from_list(callback: CallbackQuery, state: FSMContext):
    if not _is_admin(callback.from_user.id):
        await callback.answer("Нет прав администратора")
        return
    try:
        hackathon_id = int(callback.data.split(":", 1)[1])
    except ValueError:
        await callback.answer("Неверный ID")
        return

    await callback.answer()
    await _start_update_flow(callback.message, state, hackathon_id)


@router.message(Command("addhackathon"))
async def cmd_add_hackathon(message: Message, state: FSMContext):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return
    await _start_add_flow(message, state)


@router.message(Command("updatehackathon"))
async def cmd_update_hackathon(message: Message, state: FSMContext):
    if not _is_admin(message.from_user.id):
        await message.answer("❌ У тебя нет прав администратора.")
        return

    await state.set_state(UpdateHackathonForm.hackathon_id)
    await message.answer("✏️ Введи <b>ID хакатона</b> для обновления:")


@router.message(UpdateHackathonForm.hackathon_id)
async def update_form_hackathon_id(message: Message, state: FSMContext):
    text = (message.text or "").strip()

    try:
        hackathon_id = int(text)
        if hackathon_id <= 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ ID хакатона должен быть положительным целым числом.")
        return

    await _start_update_flow(message, state, hackathon_id)


@router.message(HackathonForm.name)
async def form_name(message: Message, state: FSMContext):
    name = (message.text or "").strip()
    if not name or name == "-":
        await message.answer("❌ Название не может быть пустым. Введи корректное название.")
        return
    await state.update_data(name=name)
    await state.set_state(HackathonForm.description)
    await message.answer(
        "✏️ Введи <b>краткое описание</b> хакатона (можно в одну-две строки):"
    )


@router.message(HackathonForm.description)
async def form_description(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    description = None if text == "-" else text
    await state.update_data(description=description)

    await state.update_data(tracks=[])
    await state.set_state(HackathonForm.tracks)

    kb = _tracks_keyboard(set())
    await message.answer(
        "🧩 Выбери <b>треки хакатона</b> (можно несколько).\n"
        "Нажимай кнопки, чтобы отмечать/снимать. Потом нажми <b>Готово</b>.",
        reply_markup=kb,
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
        "(обязательное поле):"
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

    reg_end_dt = _parse_date(text)
    if not reg_end_dt:
        await message.answer(
            "❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code>."
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
                InlineKeyboardButton(
                    text="🌐 Online", callback_data="mode_online"),
                InlineKeyboardButton(
                    text="🏢 Offline", callback_data="mode_offline"),
            ],
            [
                InlineKeyboardButton(
                    text="🔀 Hybrid", callback_data="mode_hybrid"),
            ],
        ]
    )

    await message.answer("🌐 Выбери <b>формат</b> хакатона:", reply_markup=keyboard)


# ===== Обработчик выбора mode =====


@router.callback_query(StateFilter(HackathonForm.mode), F.data.startswith("mode_"))
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
    mode_texts = {"online": "🌐 Online",
                  "offline": "🏢 Offline", "hybrid": "🔀 Hybrid"}

    await callback.message.answer(f"✅ Формат: <b>{mode_texts[mode_type]}</b>")

    # Продолжаем в зависимости от выбранного формата
    if mode_type == "online":
        # для онлайн-события город фиксируем как "online"
        await state.update_data(city="online")
        await state.set_state(HackathonForm.status)
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(text="🟢 Open", callback_data="add_status_open"),
                    InlineKeyboardButton(text="🔴 Closed", callback_data="add_status_closed"),
                ],
            ]
        )
        await callback.message.answer(
            "📌 Выбери <b>статус</b> хакатона:",
            reply_markup=keyboard,
        )
    else:
        await state.set_state(HackathonForm.city)
        await callback.message.answer("🏙 Введи <b>город</b> проведения:")


@router.message(HackathonForm.city)
async def form_city(message: Message, state: FSMContext):
    city = (message.text or "").strip()
    if not city or city == "-":
        await message.answer("❌ Город не может быть пустым. Введи корректный город.")
        return
    await state.update_data(city=city)
    await state.set_state(HackathonForm.status)
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🟢 Open", callback_data="add_status_open"),
                InlineKeyboardButton(text="🔴 Closed", callback_data="add_status_closed"),
            ],
        ]
    )
    await message.answer(
        "📌 Выбери <b>статус</b> хакатона:",
        reply_markup=keyboard,
    )


@router.callback_query(StateFilter(HackathonForm.status), F.data.startswith("add_status_"))
async def form_status(callback: CallbackQuery, state: FSMContext):
    status_type = callback.data.replace("add_status_", "")
    if status_type not in ("open", "closed"):
        await callback.answer("Неверный статус")
        return

    await state.update_data(status=status_type)
    await callback.answer(f"Статус: {status_type}")
    await callback.message.edit_reply_markup(reply_markup=None)
    await state.set_state(HackathonForm.team_min)
    await callback.message.answer(
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
        try:
            prize = int(text)
        except ValueError:
            await message.answer("❌ Введите целое число или '-'")
            return

        if prize < 0:
            await message.answer("❌ Призовой фонд не может быть отрицательным.")
            return

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
    
    tracks = data.get("tracks") or []
    tracks_text = ", ".join(TRACK_LABELS[t] for t in tracks) if tracks else "—"

    preview = (
        f"<b>Проверь данные хакатона:</b>\n"
        f"• Название: {data['name']}\n"
        f"• Описание: {data['description']}\n"
        f"• Даты: {data['start_date']} — {data['end_date']}\n"
        f"• Дедлайн регистрации: {data.get('registration_end_date') or '—'}\n"
        f"• Город: {data['city']}\n"
        f"• Формат: {data['mode']}\n"
        f"• Статус: {data.get('status')}\n"
        f"• Треки: {tracks_text}\n"
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
        "tracks": data.get("tracks") or [],
        "status": data.get("status") or "open",
        "city": data["city"],
        "team_members_minimum": data.get("team_members_minimum"),
        "team_members_limit": data.get("team_members_limit"),
        "registration_link": data.get("registration_link"),
        "prize_fund": data.get("prize_fund"),
    }

    try:
        created = await create_hackathon(payload)
    except Exception as e:
        await message.answer(f"⚠️ {_format_api_error(e)}")
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
    await _start_delete_flow(message, state)


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
    await _send_delete_confirmation(message, state, hackathon_id)


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
        await callback.message.answer(f"⚠️ {_format_api_error(e)}")

    await state.clear()
    await callback.answer()


@router.callback_query(F.data == "cancel_delete")
async def cancel_delete_hackathon(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.message.edit_reply_markup(reply_markup=None)
    await callback.message.answer("❌ Удаление хакатона отменено.")
    await callback.answer()


# ===== Обновление хакатона =====


@router.callback_query(StateFilter(UpdateHackathonForm.menu), F.data.startswith("upd_field:"))
async def update_select_field(callback: CallbackQuery, state: FSMContext):
    field = callback.data.split(":", 1)[1]

    await callback.answer()

    if field == "name":
        await state.set_state(UpdateHackathonForm.name)
        await callback.message.answer("✏️ Введи новое <b>название</b> или '-' чтобы оставить.")
        return
    if field == "description":
        await state.set_state(UpdateHackathonForm.description)
        await callback.message.answer(
            "✏️ Введи новое <b>описание</b>.\n"
            "Отправь '-' чтобы оставить, или <code>clear</code> чтобы очистить."
        )
        return
    if field == "dates":
        await state.set_state(UpdateHackathonForm.start_date)
        await callback.message.answer(
            "📅 Введи <b>дату начала</b> в формате <code>dd.mm.yyyy</code>\n"
            "или '-' чтобы оставить."
        )
        return
    if field == "registration_end_date":
        await state.set_state(UpdateHackathonForm.registration_end_date)
        await callback.message.answer(
            "📅 Введи <b>дедлайн регистрации</b> в формате <code>dd.mm.yyyy</code>\n"
            "Отправь '-' чтобы оставить, или <code>clear</code> чтобы очистить."
        )
        return
    if field == "mode":
        await state.set_state(UpdateHackathonForm.mode)
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(text="🌐 Online", callback_data="upd_mode_online"),
                    InlineKeyboardButton(text="🏢 Offline", callback_data="upd_mode_offline"),
                ],
                [InlineKeyboardButton(text="🔀 Hybrid", callback_data="upd_mode_hybrid")],
                [InlineKeyboardButton(text="↩️ Назад", callback_data="upd_mode_back")],
            ]
        )
        await callback.message.answer("🌐 Выбери <b>формат</b>:", reply_markup=keyboard)
        return
    if field == "status":
        await state.set_state(UpdateHackathonForm.status)
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(text="🟢 Open", callback_data="upd_status_open"),
                    InlineKeyboardButton(text="🔴 Closed", callback_data="upd_status_closed"),
                ],
                [InlineKeyboardButton(text="↩️ Назад", callback_data="upd_status_back")],
            ]
        )
        await callback.message.answer("📌 Выбери <b>статус</b>:", reply_markup=keyboard)
        return
    if field == "city":
        await state.set_state(UpdateHackathonForm.city)
        await callback.message.answer(
            "🏙 Введи <b>город</b>.\n"
            "Отправь '-' чтобы оставить, или <code>clear</code> чтобы очистить."
        )
        return
    if field == "tracks":
        data = await state.get_data()
        current = data.get("current") or {}
        updates = data.get("updates") or {}
        selected = updates.get("tracks")
        if selected is None:
            selected = current.get("tracks") or []
        await state.update_data(tracks_selection=list(selected))
        await state.set_state(UpdateHackathonForm.tracks)
        await callback.message.answer(
            "🧩 Выбери <b>треки</b> (можно несколько).",
            reply_markup=_tracks_keyboard_update(set(selected)),
        )
        return
    if field == "team":
        await state.set_state(UpdateHackathonForm.team_min)
        await callback.message.answer(
            "👥 Введи <b>минимум</b> участников в команде (1–20).\n"
            "Отправь '-' чтобы оставить, или <code>clear</code> чтобы очистить."
        )
        return
    if field == "registration_link":
        await state.set_state(UpdateHackathonForm.registration_link)
        await callback.message.answer(
            "🔗 Введи <b>ссылку на регистрацию</b>.\n"
            "Отправь '-' чтобы оставить, или <code>clear</code> чтобы очистить."
        )
        return
    if field == "prize_fund":
        await state.set_state(UpdateHackathonForm.prize_fund)
        await callback.message.answer(
            "💰 Введи <b>призовой фонд</b>.\n"
            "Отправь '-' чтобы оставить, или <code>clear</code> чтобы очистить."
        )
        return

    await callback.message.answer("❌ Неизвестное поле.")


@router.callback_query(StateFilter(UpdateHackathonForm.menu), F.data == "upd_save")
async def update_save(callback: CallbackQuery, state: FSMContext):
    data = await state.get_data()
    updates = data.get("updates") or {}
    hackathon_id = data.get("hackathon_id")

    await callback.answer()

    if not updates:
        await callback.message.answer("ℹ️ Нет изменений для сохранения.")
        await _send_update_menu(callback.message, state)
        return

    try:
        updated = await update_hackathon(hackathon_id, updates)
    except Exception as e:
        await callback.message.answer(f"⚠️ {_format_api_error(e)}")
        return

    await state.clear()
    await callback.message.answer(
        "✅ Хакатон обновлён!\n\n" + _format_hackathon_detail(updated)
    )


@router.callback_query(StateFilter(UpdateHackathonForm.menu), F.data == "upd_cancel")
async def update_cancel(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.answer()
    await callback.message.answer("❌ Обновление отменено.")


@router.message(UpdateHackathonForm.name)
async def update_name(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    if text == "-":
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(message, state)
        return

    data = await state.get_data()
    updates = data.get("updates") or {}
    updates["name"] = text
    await state.update_data(updates=updates)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)


@router.message(UpdateHackathonForm.description)
async def update_description(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    if text == "-":
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(message, state)
        return

    data = await state.get_data()
    updates = data.get("updates") or {}
    if text.lower() == "clear":
        updates["description"] = None
    else:
        updates["description"] = text
    await state.update_data(updates=updates)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)


@router.message(UpdateHackathonForm.start_date)
async def update_start_date(message: Message, state: FSMContext):
    text = (message.text or "").strip()

    data = await state.get_data()
    current = data.get("current") or {}
    updates = data.get("updates") or {}

    if text != "-":
        start_dt = _parse_date(text)
        if not start_dt:
            await message.answer(
                "❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code>."
            )
            return

        end_raw = _effective_value(current, updates, "end_date")
        end_dt = _parse_date(end_raw) if end_raw else None
        if end_dt and start_dt > end_dt:
            await message.answer(
                "❌ Дата начала не может быть позже даты окончания."
            )
            return

        updates["start_date"] = text
        await state.update_data(updates=updates)

    await state.set_state(UpdateHackathonForm.end_date)
    await message.answer(
        "📅 Введи <b>дату окончания</b> в формате <code>dd.mm.yyyy</code>\n"
        "или '-' чтобы оставить."
    )


@router.message(UpdateHackathonForm.end_date)
async def update_end_date(message: Message, state: FSMContext):
    text = (message.text or "").strip()

    data = await state.get_data()
    current = data.get("current") or {}
    updates = data.get("updates") or {}

    if text != "-":
        end_dt = _parse_date(text)
        if not end_dt:
            await message.answer(
                "❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code>."
            )
            return

        start_raw = _effective_value(current, updates, "start_date")
        start_dt = _parse_date(start_raw) if start_raw else None
        if start_dt and end_dt < start_dt:
            await message.answer(
                "❌ Дата окончания не может быть раньше даты начала."
            )
            return

        updates["end_date"] = text
        await state.update_data(updates=updates)

    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)


@router.message(UpdateHackathonForm.registration_end_date)
async def update_registration_end_date(message: Message, state: FSMContext):
    text = (message.text or "").strip()

    data = await state.get_data()
    current = data.get("current") or {}
    updates = data.get("updates") or {}

    if text == "-":
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(message, state)
        return

    if text.lower() == "clear":
        updates["registration_end_date"] = None
        await state.update_data(updates=updates)
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(message, state)
        return

    reg_dt = _parse_date(text)
    if not reg_dt:
        await message.answer(
            "❌ Неверный формат даты. Используй <code>dd.mm.yyyy</code>."
        )
        return

    start_raw = _effective_value(current, updates, "start_date")
    start_dt = _parse_date(start_raw) if start_raw else None
    if start_dt and reg_dt > start_dt:
        await message.answer(
            "❌ Дедлайн регистрации не может быть позже даты начала."
        )
        return

    updates["registration_end_date"] = text
    await state.update_data(updates=updates)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)


@router.callback_query(StateFilter(UpdateHackathonForm.mode), F.data.startswith("upd_mode_"))
async def update_mode(callback: CallbackQuery, state: FSMContext):
    mode_type = callback.data.replace("upd_mode_", "")
    if mode_type == "back":
        await callback.answer()
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(callback.message, state)
        return

    if mode_type not in ALLOWED_MODES:
        await callback.answer("Неверный формат")
        return

    data = await state.get_data()
    updates = data.get("updates") or {}
    updates["mode"] = mode_type
    if mode_type == "online":
        updates["city"] = "online"
    await state.update_data(updates=updates)

    await callback.answer(f"Формат: {mode_type}")
    await callback.message.edit_reply_markup(reply_markup=None)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(callback.message, state)


@router.callback_query(StateFilter(UpdateHackathonForm.status), F.data.startswith("upd_status_"))
async def update_status(callback: CallbackQuery, state: FSMContext):
    status_type = callback.data.replace("upd_status_", "")
    if status_type == "back":
        await callback.answer()
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(callback.message, state)
        return

    if status_type not in ("open", "closed"):
        await callback.answer("Неверный статус")
        return

    data = await state.get_data()
    updates = data.get("updates") or {}
    updates["status"] = status_type
    await state.update_data(updates=updates)

    await callback.answer(f"Статус: {status_type}")
    await callback.message.edit_reply_markup(reply_markup=None)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(callback.message, state)


@router.message(UpdateHackathonForm.city)
async def update_city(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    if text == "-":
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(message, state)
        return

    data = await state.get_data()
    updates = data.get("updates") or {}
    if text.lower() == "clear":
        updates["city"] = None
    else:
        updates["city"] = text
    await state.update_data(updates=updates)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)


@router.callback_query(StateFilter(UpdateHackathonForm.tracks), F.data.startswith("upd_track_"))
async def update_track_toggle(callback: CallbackQuery, state: FSMContext):
    track = callback.data.replace("upd_track_", "", 1)
    if track not in ALLOWED_TRACKS:
        await callback.answer("Неверный трек")
        return

    data = await state.get_data()
    selected = set(data.get("tracks_selection") or [])

    if track in selected:
        selected.remove(track)
        action = "убрано"
    else:
        selected.add(track)
        action = "добавлено"

    ordered = [t for t in ALLOWED_TRACKS if t in selected]
    await state.update_data(tracks_selection=ordered)

    await callback.message.edit_reply_markup(reply_markup=_tracks_keyboard_update(set(ordered)))
    await callback.answer(f"{TRACK_LABELS[track]}: {action}")


@router.callback_query(StateFilter(UpdateHackathonForm.tracks), F.data == "upd_tracks_clear")
async def update_tracks_clear(callback: CallbackQuery, state: FSMContext):
    await state.update_data(tracks_selection=[])
    await callback.message.edit_reply_markup(reply_markup=_tracks_keyboard_update(set()))
    await callback.answer("Очищено")


@router.callback_query(StateFilter(UpdateHackathonForm.tracks), F.data == "upd_tracks_back")
async def update_tracks_back(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(callback.message, state)


@router.callback_query(StateFilter(UpdateHackathonForm.tracks), F.data == "upd_tracks_done")
async def update_tracks_done(callback: CallbackQuery, state: FSMContext):
    data = await state.get_data()
    updates = data.get("updates") or {}
    selected = data.get("tracks_selection") or []
    updates["tracks"] = selected
    await state.update_data(updates=updates)

    await callback.message.edit_reply_markup(reply_markup=None)
    await callback.answer("Треки обновлены")
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(callback.message, state)


@router.message(UpdateHackathonForm.team_min)
async def update_team_min(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    data = await state.get_data()
    current = data.get("current") or {}
    updates = data.get("updates") or {}

    if text != "-":
        if text.lower() == "clear":
            updates["team_members_minimum"] = None
        else:
            try:
                team_min = int(text)
            except ValueError:
                await message.answer("❌ Введите число 1–20, '-' или clear.")
                return
            if not (1 <= team_min <= 20):
                await message.answer("❌ Минимум участников: 1–20.")
                return

            eff_max = _effective_value(current, updates, "team_members_limit")
            if eff_max is not None and team_min > eff_max:
                await message.answer("❌ Минимум не может быть больше максимума.")
                return
            updates["team_members_minimum"] = team_min

        await state.update_data(updates=updates)

    await state.set_state(UpdateHackathonForm.team_max)
    await message.answer(
        "👥 Введи <b>максимум</b> участников в команде (1–20).\n"
        "Отправь '-' чтобы оставить, или <code>clear</code> чтобы очистить."
    )


@router.message(UpdateHackathonForm.team_max)
async def update_team_max(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    data = await state.get_data()
    current = data.get("current") or {}
    updates = data.get("updates") or {}

    if text != "-":
        if text.lower() == "clear":
            updates["team_members_limit"] = None
        else:
            try:
                team_max = int(text)
            except ValueError:
                await message.answer("❌ Введите число 1–20, '-' или clear.")
                return
            if not (1 <= team_max <= 20):
                await message.answer("❌ Максимум участников: 1–20.")
                return

            eff_min = _effective_value(current, updates, "team_members_minimum")
            if eff_min is not None and team_max < eff_min:
                await message.answer("❌ Максимум не может быть меньше минимума.")
                return
            updates["team_members_limit"] = team_max

        await state.update_data(updates=updates)

    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)


@router.message(UpdateHackathonForm.registration_link)
async def update_registration_link(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    if text == "-":
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(message, state)
        return

    data = await state.get_data()
    updates = data.get("updates") or {}
    if text.lower() == "clear":
        updates["registration_link"] = None
    else:
        updates["registration_link"] = text
    await state.update_data(updates=updates)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)


@router.message(UpdateHackathonForm.prize_fund)
async def update_prize_fund(message: Message, state: FSMContext):
    text = (message.text or "").strip()
    if text == "-":
        await state.set_state(UpdateHackathonForm.menu)
        await _send_update_menu(message, state)
        return

    data = await state.get_data()
    updates = data.get("updates") or {}
    if text.lower() == "clear":
        updates["prize_fund"] = None
    else:
        try:
            prize = int(text)
        except ValueError:
            await message.answer("❌ Введите целое число, '-' или clear.")
            return
        if prize < 0:
            await message.answer("❌ Призовой фонд не может быть отрицательным.")
            return
        updates["prize_fund"] = prize

    await state.update_data(updates=updates)
    await state.set_state(UpdateHackathonForm.menu)
    await _send_update_menu(message, state)

@router.callback_query(StateFilter(HackathonForm.tracks), F.data.startswith("track_"))
async def process_track_toggle(callback: CallbackQuery, state: FSMContext):
    track = callback.data.replace("track_", "", 1)
    if track not in ALLOWED_TRACKS:
        await callback.answer("Неверный трек")
        return

    data = await state.get_data()
    selected = set(data.get("tracks") or [])

    if track in selected:
        selected.remove(track)
        action = "убрано"
    else:
        selected.add(track)
        action = "добавлено"

    # сохраняем в стабильном порядке (как в ALLOWED_TRACKS)
    ordered = [t for t in ALLOWED_TRACKS if t in selected]
    await state.update_data(tracks=ordered)

    await callback.message.edit_reply_markup(reply_markup=_tracks_keyboard(set(ordered)))
    await callback.answer(f"{TRACK_LABELS[track]}: {action}")


@router.callback_query(StateFilter(HackathonForm.tracks), F.data == "tracks_clear")
async def process_tracks_clear(callback: CallbackQuery, state: FSMContext):
    await state.update_data(tracks=[])
    await callback.message.edit_reply_markup(reply_markup=_tracks_keyboard(set()))
    await callback.answer("Очищено")


@router.callback_query(StateFilter(HackathonForm.tracks), F.data == "tracks_done")
async def process_tracks_done(callback: CallbackQuery, state: FSMContext):
    data = await state.get_data()
    tracks = data.get("tracks") or []
    tracks_text = ", ".join(TRACK_LABELS[t] for t in tracks) if tracks else "—"

    await callback.message.edit_reply_markup(reply_markup=None)
    await callback.message.answer(f"✅ Треки: <b>{tracks_text}</b>")

    await state.set_state(HackathonForm.start_date)
    await callback.message.answer(
        "📅 Введи <b>дату начала</b> в формате <code>dd.mm.yyyy</code> "
        "(например, 10.01.2025):"
    )
    await callback.answer()
