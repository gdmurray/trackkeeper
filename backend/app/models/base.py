from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Base(BaseModel):
    id: int
    created_at: datetime

class BaseInsert(BaseModel):
    id: Optional[int] = None
    created_at: Optional[datetime] = None