from datetime import datetime
from pydantic import BaseModel, Field
from pydantic import ConfigDict


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    username: str

    model_config = ConfigDict(from_attributes=True)


class MessageIn(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class MessageOut(BaseModel):
    id: int
    sender_username: str
    content: str
    created_at: datetime
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileOut(BaseModel):
    id: int
    original_name: str
    size_bytes: int
    created_at: datetime
    expires_at: datetime
    download_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
