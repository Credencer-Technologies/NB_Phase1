from pydantic import BaseModel

class OfferSchema(BaseModel):

    offer_name:str

    price_min:float

    price_max:float


class ServiceCreateSchema(BaseModel):
    provider_id: int
    category_id: int | None = None
    service_name: str
    custom_service_title: str | None = None
    service_bio: str | None = None
    service_profile_image: str | None = None
    is_item_available: bool = True
    service_mode: str | None = None


class ServiceUpdateSchema(BaseModel):
    category_id: int | None = None
    service_name: str
    custom_service_title: str | None = None
    service_bio: str | None = None
    service_profile_image: str | None = None
    is_item_available: bool = True
    service_mode: str | None = None


