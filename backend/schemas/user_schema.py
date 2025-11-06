from pydantic import BaseModel, HttpUrl
from typing import Optional, List

class UserUpdateSchema(BaseModel):
    tg_link: HttpUrl
    bio: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    university: Optional[str] = None
    link: HttpUrl
    skills: List[str]
