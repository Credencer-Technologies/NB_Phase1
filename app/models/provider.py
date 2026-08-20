from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DECIMAL,
    Enum,
    TIMESTAMP,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from app.database import Base


class Provider(Base):

    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)

    # Phone is kept for existing data,
    # but it is no longer required for email-based login.
    phone = Column(
        String(15),
        unique=True,
        nullable=True
    )

    # Email will be used for provider login.
    email = Column(
        String(150),
        unique=True,
        nullable=True,
        index=True
    )

    city = Column(String(100), nullable=False)

    pin_code = Column(
        String(10),
        nullable=True
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True
    )

    bio = Column(
        Text,
        nullable=True
    )

    service_description = Column(
        Text,
        nullable=True
    )

    id_type = Column(
        Enum(
            "Aadhaar",
            "PAN Card",
            "Voter ID"
        ),
        nullable=True
    )

    id_document_url = Column(
        String(255),
        nullable=True
    )

    # New providers must wait for admin approval.
    # Only the admin should change this to "approved".
    status = Column(
        Enum(
            "pending",
            "approved",
            "rejected"
        ),
        default="pending"
    )

    rejection_reason = Column(
        Text,
        nullable=True
    )

    is_available = Column(
        Boolean,
        default=True
    )

    # Kept for compatibility with your current database.
    # Later, if needed, this can be changed to is_email_verified.
    is_phone_verified = Column(
        Boolean,
        default=False
    )

    avg_rating = Column(
        DECIMAL(2, 1),
        default=0.0
    )

    ratings_count = Column(
        Integer,
        default=0
    )

    completed_enquiries_count = Column(
        Integer,
        default=0
    )

    profile_image = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

    # 30-day account deletion grace period.
    # While deletion_requested_at is set,
    # the provider stays in MySQL but is hidden from public routes.
    deletion_requested_at = Column(
        DateTime,
        nullable=True
    )

    permanent_delete_at = Column(
        DateTime,
        nullable=True
    )