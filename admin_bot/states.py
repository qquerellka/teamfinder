# admin_bot/states.py
from __future__ import annotations

from aiogram.fsm.state import State, StatesGroup


class HackathonForm(StatesGroup):
    name = State()
    description = State()
    start_date = State()
    end_date = State()
    registration_end_date = State()
    city = State()
    mode = State()
    team_min = State()
    team_max = State()
    registration_link = State()
    prize_fund = State()
    confirm = State()
