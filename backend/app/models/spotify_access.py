from datetime import datetime
from .base import Base, BaseInsert
from pydantic import BaseModel
from typing import Optional

class SpotifyAccess(Base):
    access_token: str
    refresh_token: str
    expires_at: Optional[datetime] = None
    user_id: str

class SpotifyAccessInsert(BaseInsert):
    access_token: str
    refresh_token: str
    expires_at: Optional[datetime] = None
    user_id: str

class SpotifyAccessUpdate(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    user_id: Optional[str] = None