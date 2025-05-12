from typing import Generic, TypeVar, List
from pydantic import BaseModel
from app.dtos.PlateResponse import PlateResponse

class BaseResponse(BaseModel):
    success: bool
    total: int
    message: str
    data: List[PlateResponse]

