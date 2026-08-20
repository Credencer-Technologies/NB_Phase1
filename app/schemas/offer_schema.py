from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class OfferCreate(BaseModel):
    service_id: int = Field(gt=0)
    offer_name: str = Field(min_length=1, max_length=150)
    price_min: Decimal = Field(ge=0)
    price_max: Decimal = Field(ge=0)

    @model_validator(mode="after")
    def validate_offer(self):
        self.offer_name = self.offer_name.strip()

        if not self.offer_name:
            raise ValueError("offer_name cannot be empty")

        if self.price_max < self.price_min:
            raise ValueError(
                "price_max must be greater than or equal to price_min"
            )

        return self


class OfferUpdate(BaseModel):
    offer_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    price_min: Optional[Decimal] = Field(default=None, ge=0)
    price_max: Optional[Decimal] = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_offer(self):
        if self.offer_name is not None:
            self.offer_name = self.offer_name.strip()

            if not self.offer_name:
                raise ValueError("offer_name cannot be empty")

        if (
            self.price_min is not None
            and self.price_max is not None
            and self.price_max < self.price_min
        ):
            raise ValueError(
                "price_max must be greater than or equal to price_min"
            )

        return self


class OfferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    offer_name: str
    price_min: Decimal
    price_max: Decimal