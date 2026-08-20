from typing import Optional

from pydantic import BaseModel, ConfigDict


class FavoriteCreate(BaseModel):
    user_id: int
    service_id: int


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    service_id: int
    service_name: Optional[str] = None
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)