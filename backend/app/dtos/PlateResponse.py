from pydantic import BaseModel
from datetime import datetime

class PlateResponse(BaseModel):
    plate_number: str
    image_url: str
    crop_image_url: str
    detected_at: datetime | None = None
    left_at: datetime | None = None
    process_time: float | None = None  
    source: str | None = None  