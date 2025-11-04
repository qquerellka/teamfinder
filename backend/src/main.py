from dotenv import load_dotenv
import os

# Загружаем переменные окружения из .env
load_dotenv()

# Проверка, что PYTHONPATH загружен правильно
print(f"PYTHONPATH: {os.getenv('PYTHONPATH')}")

from fastapi import FastAPI
from src.api.v1.users import router  # Импортируем роуты для пользователей

app = FastAPI()

# Подключаем роуты
app.include_router(router, prefix="/v1/users", tags=["users"])
