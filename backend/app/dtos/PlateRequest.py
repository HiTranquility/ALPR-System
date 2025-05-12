from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlateRequest(BaseModel):
    plate_number: str
    detected_at: Optional[datetime] | None = None
    left_at: Optional[datetime] | None = None
    source: Optional[str] | None = None