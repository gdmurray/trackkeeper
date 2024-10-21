from .base import Base, BaseInsert
from pydantic import BaseModel
from typing import Optional

class UserSettings(Base):
    playlist_persistence: str
    snapshots_enabled: bool
    user_id: str

class UserSettingsInsert(BaseInsert):
    playlist_persistence: Optional[str] = "forever"
    snapshots_enabled: Optional[bool] = True
    user_id: str

class UserSettingsUpdate(BaseModel):
    playlist_persistence: Optional[str] = None
    snapshots_enabled: Optional[bool] = None
    user_id: Optional[str] = None