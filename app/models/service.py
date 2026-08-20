from sqlalchemy import (
    Column,
    String,
    Text,
    TIMESTAMP,
    ForeignKey,
    text,
)
from sqlalchemy.dialects.mysql import INTEGER, TINYINT, ENUM

from app.database import Base
from sqlalchemy.orm import relationship


class Service(Base):
    __tablename__ = "services"

    id = Column(INTEGER(unsigned=True), primary_key=True, index=True)

    provider_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("providers.id"),
        nullable=False
    )

    category_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("categories.id"),
        nullable=True
    )

    service_name = Column(String(150), nullable=False)

    custom_service_title = Column(String(150), nullable=True)

    service_bio = Column(Text, nullable=True)

    service_profile_image = Column(String(255), nullable=True)

    is_item_available = Column(
        TINYINT(1),
        nullable=False,
        server_default=text("1")
    )

    service_mode = Column(
        ENUM("home_visit", "at_shop", "online"),
        nullable=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )

    offers = relationship(
    "Offer",
    back_populates="service",
    cascade="all, delete-orphan",
    passive_deletes=True,
)