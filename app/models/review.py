from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.sql import func

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    provider_id = Column(
        INTEGER(unsigned=True),
        ForeignKey(
            "providers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    service_id = Column(
        INTEGER(unsigned=True),
        ForeignKey(
            "services.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # Keep this without a foreign key temporarily.
    # Guest reviews send user_id as null.
    user_id = Column(
        Integer,
        nullable=True,
        index=True,
    )

    customer_name = Column(
        String(150),
        nullable=False,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    review = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )