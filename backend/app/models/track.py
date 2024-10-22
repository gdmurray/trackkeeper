from datetime import datetime
from pydantic import BaseModel


class Track(BaseModel):
    id: str
    name: str
    artist: str
    album: str
    image: str
    added_at: str