from sqlalchemy import Column, Integer, String
from app.database import Base


class OTPToken(Base):
    __tablename__ = "otp_tokens"

    id = Column(Integer, primary_key=True, index=True)

    phone = Column(String(15))

    otp = Column(String(6))
