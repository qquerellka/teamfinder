from functools import lru_cache  # Для кэширования результатов функции
from typing import List, Optional  # Для аннотаций типов (List, Optional)
from pydantic_settings import BaseSettings, SettingsConfigDict  # Импорт классов для работы с настройками

# Класс для управления настройками приложения с использованием pydantic
class Settings(BaseSettings):
    # ЯВНО: читать .env, игнорировать лишние ключи, не различать регистр
    model_config = SettingsConfigDict(
        env_file=".env",  # Указываем файл .env для загрузки настроек
        env_file_encoding="utf-8",  # Указываем кодировку для чтения файла .env
        extra="ignore",  # Игнорируем любые лишние ключи в файле .env
        case_sensitive=False,  # Не учитываем регистр при загрузке настроек
    )

    # ==== App ====
    APP_NAME: str = "MyBackend"  # Название приложения
    APP_VERSION: str = "0.1.0"  # Версия приложения
    APP_ENV: str = "dev"  # Окружение (например, "dev", "prod")

    # ==== CORS ====
    CORS_ORIGINS: str = "*"  # Разрешенные источники для CORS. "*" означает разрешение всех источников.

    # ==== Postgres ====
    POSTGRES_HOST: str = "localhost"  # Хост для подключения к базе данных
    POSTGRES_PORT: int = 5432  # Порт для подключения к базе данных
    POSTGRES_DB: str = "app_db"  # Имя базы данных
    POSTGRES_USER: str = "app_user"  # Пользователь базы данных
    POSTGRES_PASSWORD: str = "app_password"  # Пароль пользователя базы данных
    DATABASE_URL: Optional[str] = None  # URL для базы данных, если он указан (может переопределить другие параметры)

    # ==== Pool/Echo ====
    DB_POOL_SIZE: int = 5  # Размер пула подключений к базе данных
    DB_MAX_OVERFLOW: int = 10  # Максимальное количество переполненных подключений
    DB_ECHO: bool = False  # Включение/выключение логирования SQL-запросов

    # ==== Auth (ОБЯЗАТЕЛЬНО объявить, иначе будет extra_forbidden) ====
    TELEGRAM_BOT_TOKEN: str = ""  # Токен для Telegram бота, должен быть заполнен в .env
    JWT_SECRET: str = "dev-secret-change-me"  # Секрет для подписи JWT токенов

    # Метод, который возвращает список разрешенных источников CORS
    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        # Если CORS_ORIGINS пуст, возвращаем пустой список
        if not self.CORS_ORIGINS:
            return []
        # Если значение "*" (разрешены все источники), возвращаем список с одним элементом "*"
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        # Разбиваем строку на список и удаляем лишние пробелы
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # Метод, который возвращает строку подключения к базе данных
    @property
    def database_url(self) -> str:
        # Если DATABASE_URL задан, возвращаем его значение
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # Если DATABASE_URL не задан, строим строку подключения на основе других параметров
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

# Использование кэширования для хранения настроек и ускорения доступа к ним
@lru_cache
def _get_settings() -> Settings:
    # Возвращаем объект настроек, который автоматически загрузит данные из .env
    return Settings()

# Получаем настройки, вызывая кэшированную функцию
settings = _get_settings()
