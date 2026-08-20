from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReviewCreate(BaseModel):
    provider_id: int
    service_id: int
    user_id: Optional[int] = None
    customer_name: str = Field(min_length=1, max_length=150)
    rating: int = Field(ge=1, le=5)
    review: str = Field(min_length=1, max_length=2000)

    @model_validator(mode="after")
    def clean_fields(self):
        self.customer_name = self.customer_name.strip()
        self.review = self.review.strip()
        return self


class ReviewUpdate(BaseModel):
    customer_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    review: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=2000,
    )

    @model_validator(mode="after")
    def validate_update(self):
        if self.customer_name is not None:
            self.customer_name = self.customer_name.strip()

        if self.review is not None:
            self.review = self.review.strip()

        if (
            self.customer_name is None
            and self.rating is None
            and self.review is None
        ):
            raise ValueError("At least one field must be supplied.")

        return self


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_id: int
    service_id: int
    user_id: Optional[int]
    customer_name: str
    rating: int
    review: str
    created_at: datetime