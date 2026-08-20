from sqlalchemy import Column, Integer, String
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(
        String(150),
        nullable=False
    )

    # Keep phone for existing users.
    # It is no longer used for login.
    phone = Column(
        String(15),
        unique=True,
        nullable=True
    )

    # Email is now used for login.
    email = Column(
        String(150),
        unique=True,
        nullable=True,
        index=True
    )

    otp = Column(
        String(10),
        nullable=True
    )