from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.orm import relationship

from app.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    user_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    service_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
    )

    service_name = Column(
        String(150),
        nullable=True,
    )

    category_name = Column(
        String(150),
        nullable=True,
    )

    user = relationship("User")
    service = relationship("Service")