from sqlalchemy import (
    Column,
    String,
    DECIMAL,
    ForeignKey,
    TIMESTAMP,
    text,
)
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.orm import relationship

from app.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    service_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    offer_name = Column(
        String(150),
        nullable=False,
    )

    price_min = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    price_max = Column(
        DECIMAL(10, 2),
        nullable=False,
    )

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    )

    service = relationship(
        "Service",
        back_populates="offers",
    )