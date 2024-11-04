from datetime import datetime
from .base import Base, BaseInsert
from pydantic import BaseModel
from typing import Optional


class TrackedPlaylist(Base):
    active: bool
    liked_songs: bool
    playlist_id: str
    playlist_name: str
    public: bool
    removed_playlist_id: Optional[str] = None
    removed_playlist_name: Optional[str] = None
    removed_at: Optional[datetime] = None
    user_id: str


class TrackedPlaylistInsert(BaseInsert):
    active: Optional[bool] = True
    liked_songs: Optional[bool] = False
    playlist_id: str
    playlist_name: str
    public: Optional[bool] = False
    removed_playlist_id: Optional[str] = None
    removed_playlist_name: Optional[str] = None
    user_id: str


class TrackedPlaylistUpdate(BaseModel):
    active: Optional[bool] = None
    liked_songs: Optional[bool] = None
    playlist_id: Optional[str] = None
    playlist_name: Optional[str] = None
    public: Optional[bool] = None
    removed_playlist_id: Optional[str] = None
    removed_playlist_name: Optional[str] = None
    user_id: Optional[str] = None
