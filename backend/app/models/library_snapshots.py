from pydantic import BaseModel
from .base import Base, BaseInsert
from datetime import datetime
from typing import Optional


class LibrarySnapshot(Base):
    playlist_id: Optional[int] = None
    snapshot_id: Optional[str] = None
    song_count: Optional[int] = None
    user_id: str


class LibrarySnapshotInsert(BaseInsert):
    playlist_id: Optional[int] = None
    snapshot_id: Optional[str] = None
    song_count: Optional[int] = None
    user_id: str


class LibrarySnapshotUpdate(BaseModel):
    playlist_id: Optional[int] = None
    snapshot_id: Optional[str] = None
    song_count: Optional[int] = None
    user_id: Optional[str] = None
