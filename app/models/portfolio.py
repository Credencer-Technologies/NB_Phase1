from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    TIMESTAMP,
    text,
)
from sqlalchemy.dialects.mysql import INTEGER, SMALLINT

from app.database import Base


class Portfolio(Base):
    __tablename__ = "service_portfolio_images"

    id = Column(INTEGER(unsigned=True), primary_key=True, index=True)

    service_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("services.id"),
        nullable=False
    )

    image_url = Column(String(255), nullable=False)

    sort_order = Column(
        SMALLINT(unsigned=True),
        nullable=False,
        server_default=text("0")
    )

    uploaded_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )