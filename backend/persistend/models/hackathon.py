from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import ENUM
from datetime import datetime
from backend.persistend.base import Base

# Определяем ENUM типы для PostgreSQL
hackathon_mode_enum = ENUM('online', 'offline', 'hybrid', name='hackathon_mode', create_type=False)
hackathon_status_enum = ENUM('draft', 'open', 'closed', name='hackathon_status', create_type=False)

class Hackathon(Base):
    __tablename__ = "hackathon"  # Имя таблицы в базе данных (единственное число)
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    description = Column(Text)
    image_link = Column(Text)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    registration_end_date = Column(DateTime)
    mode = Column(hackathon_mode_enum, nullable=False)  # ENUM: online, offline, hybrid
    city = Column(Text)
    team_members_minimum = Column(Integer)
    team_members_limit = Column(Integer)
    registration_link = Column(Text)
    prize_fund = Column(Text)
    status = Column(hackathon_status_enum, nullable=False)  # ENUM: draft, open, closed

    def __repr__(self):
        return f"<Hackathon {self.name} ({self.status})>"
