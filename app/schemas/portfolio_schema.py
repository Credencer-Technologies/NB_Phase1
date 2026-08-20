from pydantic import BaseModel
from typing import Optional


class PortfolioUploadSchema(BaseModel):
    service_id: int
    image_url: str
    sort_order: Optional[int] = 0


class PortfolioResponse(BaseModel):
    id: int
    service_id: int
    image_url: str
    sort_order: int

    class Config:
        from_attributes = True