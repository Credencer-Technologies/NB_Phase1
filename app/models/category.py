from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, text
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(120), unique=True, nullable=False)

    icon = Column(String(50), nullable=True)
    image_url = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    is_active = Column(Boolean, nullable=False, server_default=text("1"))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )