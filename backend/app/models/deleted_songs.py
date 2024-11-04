from typing import Optional
from .base import Base, BaseInsert
from datetime import datetime
from pydantic import BaseModel


class DeletedSong(Base):
    playlist_id: str
    removed_at: datetime
    track_id: str
    user_id: str
    active: bool


class DeletedSongInsert(BaseInsert):
    playlist_id: str
    removed_at: datetime
    track_id: str
    user_id: str
    active: Optional[bool] = True


class DeletedSongUpdate(BaseModel):
    playlist_id: Optional[str] = None
    removed_at: Optional[datetime] = None
    track_id: Optional[str] = None
    user_id: Optional[str] = None
    active: Optional[bool] = None
