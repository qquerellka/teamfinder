from sqlalchemy import Column, BigInteger, Text, Integer, JSON
from persistent.db.base import Base, WithId, WithCreatedAt, WithUpdatedAt


class User(Base, WithId, WithCreatedAt, WithUpdatedAt):
    __tablename__ = "users"

    telegram_id = Column(BigInteger, unique=True, nullable=False)
    username = Column(Text)
    name = Column(Text)
    surname = Column(Text)
    avatar_url = Column(Text)
    bio = Column(Text)
    age = Column(Integer)
    city = Column(Text)
    university = Column(Text)
    link = Column(Text, nullable=False)
    skills = Column(JSON, nullable=False)
