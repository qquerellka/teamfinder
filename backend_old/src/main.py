# Загружаем библиотеку для работы с переменными окружения из файла .env
from dotenv import load_dotenv
# Импортируем модуль для работы с операционной системой
import os

# Загружаем переменные окружения из .env
load_dotenv()
# Теперь можно использовать os.getenv('NAME') для доступа к переменным из .env файла

# Проверка, что PYTHONPATH загружен правильно
print(f"PYTHONPATH: {os.getenv('PYTHONPATH')}")
# Это помогает убедиться, что Python видит все модули и пакеты

from fastapi import FastAPI
from src.api.v1.users import router  # Импортируем роуты для пользователей

app = FastAPI()

# Подключаем роуты
app.include_router(router, prefix="/v1/users", tags=["users"])
# - router: объект с эндпоинтами из users.py
# - prefix="/v1/users": добавляет этот префикс ко всем путям роутера
# - tags=["users"]: группирует эндпоинты в документации Swagger
