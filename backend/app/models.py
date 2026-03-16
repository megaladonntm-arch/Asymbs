from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_username = Column(String(64), index=True, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, index=True, nullable=False)


class FileUpload(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    uploader_username = Column(String(64), index=True, nullable=False)
    original_name = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, index=True, nullable=False)
