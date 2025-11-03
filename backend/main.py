from fastapi import FastAPI
from src.api.v1.users import router  # Импортируем роуты для пользователей

app = FastAPI()

# Подключаем роуты
app.include_router(router, prefix="/v1/users", tags=["users"])
