from pydantic import BaseModel, EmailStr
from typing import Optional


class ProviderRegisterSchema(BaseModel):
    full_name: str

    # Phone is optional now because login/verification is email-based.
    phone: Optional[str] = None

    # Email is mandatory for provider registration.
    email: EmailStr

    city: str
    pin_code: str

    category_id: int

    bio: Optional[str] = None
    service_description: Optional[str] = None

    id_type: Optional[str] = None
    id_document_url: Optional[str] = None

    # Optional so a provider who uploads a photo during signup
    # can have it saved immediately too.
    profile_image: Optional[str] = None


class ProviderUpdateSchema(BaseModel):
    full_name: Optional[str] = None

    email: Optional[EmailStr] = None

    category_id: Optional[int] = None

    city: Optional[str] = None
    pin_code: Optional[str] = None

    bio: Optional[str] = None
    service_description: Optional[str] = None

    is_available: Optional[bool] = None

    profile_image: Optional[str] = None