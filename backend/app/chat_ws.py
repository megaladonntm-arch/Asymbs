import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Set

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import SessionLocal
from app.logger import log_event
from app.config import settings
import jwt


class ConnectionManager:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, username: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self.active.setdefault(username, set()).add(websocket)

    async def disconnect(self, username: str, websocket: WebSocket) -> None:
        async with self._lock:
            sockets = self.active.get(username)
            if sockets and websocket in sockets:
                sockets.remove(websocket)
                if not sockets:
                    self.active.pop(username, None)

    async def broadcast(self, message: dict) -> None:
        async with self._lock:
            sockets = [ws for group in self.active.values() for ws in group]
        for ws in sockets:
            await ws.send_json(message)

    async def online_users(self) -> list[str]:
        async with self._lock:
            return sorted(self.active.keys())


manager = ConnectionManager()


def _get_username_from_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


def _get_recent_messages(db: Session, limit: int = 50) -> list[models.Message]:
    now = datetime.now(timezone.utc)
    return (
        db.query(models.Message)
        .filter(models.Message.expires_at > now)
        .order_by(models.Message.created_at.desc())
        .limit(limit)
        .all()[::-1]
    )


async def websocket_endpoint(websocket: WebSocket, username: str) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    token_username = _get_username_from_token(token)
    if token_username != username:
        await websocket.close(code=1008)
        return

    await manager.connect(username, websocket)
    log_event(f"user joined: {username}")

    db = SessionLocal()
    try:
        history = _get_recent_messages(db)
        for msg in history:
            await websocket.send_json(
                {
                    "type": "message",
                    "id": msg.id,
                    "sender_username": msg.sender_username,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                    "expires_at": msg.expires_at.isoformat(),
                }
            )

        online = await manager.online_users()
        await manager.broadcast({"type": "status", "event": "joined", "username": username, "online": online})

        while True:
            data = await websocket.receive_json()
            if data.get("type") != "message":
                continue

            try:
                msg_in = schemas.MessageIn(**{"content": data.get("content", "")})
            except ValidationError:
                continue

            now = datetime.now(timezone.utc)
            msg = models.Message(
                sender_username=username,
                content=msg_in.content,
                created_at=now,
                expires_at=now + timedelta(seconds=settings.message_ttl_seconds),
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)

            await manager.broadcast(
                {
                    "type": "message",
                    "id": msg.id,
                    "sender_username": msg.sender_username,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                    "expires_at": msg.expires_at.isoformat(),
                }
            )
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
        await manager.disconnect(username, websocket)
        online = await manager.online_users()
        await manager.broadcast({"type": "status", "event": "left", "username": username, "online": online})
        log_event(f"user left: {username}")
