from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

Base = declarative_base()


class WithId:
    __abstract__ = True
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class WithCreatedAt:
    __abstract__ = True
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class WithUpdatedAt:
    __abstract__ = True
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
