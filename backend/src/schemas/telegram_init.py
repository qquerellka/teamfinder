# Импортирует BaseModel из Pydantic - основа для создания моделей данных с валидацией
from pydantic import BaseModel
# Импортирует типы данных - Optional - для указания необязательных полей
from typing import Optional, List

# UserInitData будет использоваться для валидации и сериализации данных пользователя при инициализации
class UserInitData(BaseModel):
    telegram_id: int
    # может быть строкой или None(значение по умолчанию)
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: Optional[str] = None
    avatar_url: Optional[str] = None

    # поля, вводимые вручную
    bio: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    university: Optional[str] = None
    link: Optional[str] = None
    skills: Optional[List[str]] = []

    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    # Конфигурационный класс для Pydantic модели
    # orm_mode = True - позволяет модели работать с ORM объектами
    # (например, SQLAlchemy моделями), автоматически преобразуя их в словари
    class Config:
        orm_mode = True