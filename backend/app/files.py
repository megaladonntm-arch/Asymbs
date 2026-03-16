import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.utils import get_current_user, _get_user_from_token
from app.config import settings

router = APIRouter()


def _ensure_storage_dir() -> None:
    os.makedirs(settings.files_dir, exist_ok=True)


@router.post("/upload", response_model=schemas.FileOut)
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_storage_dir()

    file_id = str(uuid.uuid4())
    storage_name = f"{file_id}_{os.path.basename(file.filename)}"
    storage_path = os.path.join(settings.files_dir, storage_name)

    size = 0
    try:
        with open(storage_path, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > settings.max_upload_bytes:
                    raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
                out.write(chunk)
    except HTTPException:
        if os.path.exists(storage_path):
            os.remove(storage_path)
        raise
    finally:
        await file.close()

    now = datetime.now(timezone.utc)
    record = models.FileUpload(
        uploader_username=current_user.username,
        original_name=file.filename,
        storage_path=storage_path,
        size_bytes=size,
        created_at=now,
        expires_at=now + timedelta(seconds=settings.file_ttl_seconds),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.FileOut(
        id=record.id,
        original_name=record.original_name,
        size_bytes=record.size_bytes,
        created_at=record.created_at,
        expires_at=record.expires_at,
        download_url=f"/files/{record.id}",
    )


@router.get("/files/{file_id}")
def download_file(
    file_id: int,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    if token:
        _get_user_from_token(token, db)
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    record = db.query(models.FileUpload).filter(models.FileUpload.id == file_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    now = datetime.now(timezone.utc)
    if record.expires_at <= now:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="File expired")

    if not os.path.exists(record.storage_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing")

    return FileResponse(
        path=record.storage_path,
        filename=record.original_name,
        media_type="application/octet-stream",
    )
