import asyncio
import os
from datetime import datetime

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.auth import router as auth_router
from app.chat_ws import websocket_endpoint
from app.database import Base, engine, SessionLocal
from app.files import router as files_router
from app.logger import log_event
from app.config import settings

app = FastAPI(title="Anonymous Messenger MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(files_router)


@app.on_event("startup")
async def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.files_dir, exist_ok=True)
    log_event("server started")
    asyncio.create_task(_cleanup_loop())


@app.websocket("/chat/{username}")
async def chat_ws(username: str, websocket: WebSocket):
    await websocket_endpoint(websocket, username)


async def _cleanup_loop() -> None:
    while True:
        await asyncio.sleep(settings.cleanup_interval_seconds)
        now = datetime.utcnow()
        db = SessionLocal()
        try:
            expired_files = db.query(models.FileUpload).filter(models.FileUpload.expires_at <= now).all()
            for f in expired_files:
                try:
                    if os.path.exists(f.storage_path):
                        os.remove(f.storage_path)
                except OSError:
                    pass
                db.delete(f)

            if expired_files:
                db.commit()
        finally:
            db.close()
