import os
import json
import time

# Предполагаем, что у тебя репозиторий выглядит как класс UsersRepo(...)
from src.repositories.users import UsersRepository
from src.core.db import make_session  # или как у тебя создаётся сессия

def test_create_and_get_user(pg_url):
    repo = UsersRepository()
    # создаём
    data = {
        "telegramID": 123456789,
        "username": "andrey",
        "name": "Андрей",
        "skills": ["python", "sql"],
        "links": {"github": "https://github.com/x"},
    }
    u = repo.create(**data)
    assert u["id"] > 0

    # читаем
    got = repo.get_by_telegram_id(123456789)
    assert got["username"] == "andrey"
    assert got["skills"] == ["python", "sql"]
    assert got["links"]["github"].startswith("https://")

def test_unique_telegram_id(pg_url):
    repo = UsersRepository()
    repo.create(telegramID=1)
    # второй с тем же telegramID должен упасть
    raised = False
    try:
        repo.create(telegramID=1)
    except Exception:
        raised = True
    assert raised

def test_update_partial_and_timestamps(pg_url):
    repo = UsersRepository()
    u = repo.create(telegramID=2, name="A")
    t1 = u["updatedAt"]
    repo.update_by_telegram_id(2, name="B", achievements=["win"])
    u2 = repo.get_by_telegram_id(2)
    assert u2["name"] == "B"
    assert u2["achievements"] == ["win"]
    assert u2["updatedAt"] >= t1
