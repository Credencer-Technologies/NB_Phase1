from sqlalchemy import (
    Column,
    String,
    Text,
    TIMESTAMP,
    ForeignKey,
    text,
)
from sqlalchemy.dialects.mysql import INTEGER
from app.database import Base


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(INTEGER(unsigned=True), primary_key=True, index=True)

    provider_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("providers.id"),
        nullable=False
    )

    service_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("services.id"),
        nullable=True
    )

    user_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("users.id"),
        nullable=True
    )

    customer_name = Column(String(150), nullable=False)

    customer_phone = Column(String(15), nullable=False)

    message = Column(Text, nullable=False)

    status = Column(
        String(20),
        nullable=False,
        server_default=text("'new'")
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=text(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        )
    )