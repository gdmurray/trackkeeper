from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class CachedTrack(BaseModel):
    id: int
    created_at: datetime
    track_id: str
    updated_at: Optional[datetime] = None
    name: Optional[str] = None
    artist: Optional[str] = None
    image: Optional[str] = None
    album: Optional[str] = None


class CachedTrackInsert(BaseModel):
    track_id: str
    updated_at: datetime
    name: Optional[str] = None
    artist: Optional[str] = None
    image: Optional[str] = None
    album: Optional[str] = None


class CachedTrackUpdate(BaseModel):
    updated_at: Optional[datetime] = None
    name: Optional[str] = None
    artist: Optional[str] = None
    image: Optional[str] = None
    album: Optional[str] = None
