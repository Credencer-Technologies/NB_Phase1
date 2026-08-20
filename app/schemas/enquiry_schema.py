from pydantic import BaseModel
from datetime import datetime


class EnquiryCreate(BaseModel):
    provider_id: int
    service_id: int | None = None
    user_id: int | None = None
    customer_name: str
    customer_phone: str
    message: str


class EnquiryResponse(EnquiryCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True