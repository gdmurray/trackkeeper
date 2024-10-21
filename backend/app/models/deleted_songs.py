from typing import Optional
from .base import Base, BaseInsert
from datetime import datetime
from pydantic import BaseModel

class DeletedSong(Base):
    playlist_id: str
    removed_at: datetime
    track_id: str
    user_id: str

class DeletedSongInsert(BaseInsert):
    playlist_id: str
    removed_at: datetime
    track_id: str
    user_id: str

class DeletedSongUpdate(BaseModel):
    playlist_id: Optional[str] = None
    removed_at: Optional[datetime] = None
    track_id: Optional[str] = None
    user_id: Optional[str] = None