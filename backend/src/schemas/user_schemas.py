from pydantic import BaseModel
from typing import Optional, List

class UserUpdate(BaseModel):
    tg_link: str
    bio: str
    age: int
    city: str
    university: str
    skills: List[str]
    link: str

class UserResponse(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str]
    name: Optional[str]
    surname: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    age: Optional[int]
    city: Optional[str]
    university: Optional[str]
    skills: List[str]
    link: Optional[str]
    
    class Config:
        orm_mode = True