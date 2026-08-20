from pydantic import BaseModel, EmailStr


class UserRegisterSchema(BaseModel):
    full_name: str
    phone: str
    email: EmailStr