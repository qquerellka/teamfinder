from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Загружаем .env файл
load_dotenv()

class Settings(BaseSettings):
    database_url: str = os.getenv('DATABASE_URL')

settings = Settings()
