from pydantic import BaseModel


class SendOTPSchema(BaseModel):
    email: str


class VerifyOTPSchema(BaseModel):
    email: str
    otp: str