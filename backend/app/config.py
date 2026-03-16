import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = os.getenv("SECRET_KEY", "change-me-in-prod")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    files_dir: str = os.getenv("FILES_DIR", "./storage")
    message_ttl_seconds: int = int(os.getenv("MESSAGE_TTL_SECONDS", "3600"))
    file_ttl_seconds: int = int(os.getenv("FILE_TTL_SECONDS", "3600"))
    max_upload_bytes: int = int(os.getenv("MAX_UPLOAD_BYTES", str(100 * 1024 * 1024)))
    cleanup_interval_seconds: int = int(os.getenv("CLEANUP_INTERVAL_SECONDS", "300"))


settings = Settings()
