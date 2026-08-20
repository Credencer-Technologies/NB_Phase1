from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.offer import Offer
from app.models.service import Service
from app.schemas.offer_schema import (
    OfferCreate,
    OfferResponse,
    OfferUpdate,
)


router = APIRouter(
    prefix="/offers",
    tags=["Offers"],
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_offer(
    offer: OfferCreate,
    db: Session = Depends(get_db),
):
    service_exists = (
        db.query(Service.id)
        .filter(Service.id == offer.service_id)
        .first()
    )

    if service_exists is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    new_offer = Offer(**offer.model_dump())

    try:
        db.add(new_offer)
        db.commit()
        db.refresh(new_offer)
    except Exception:
        db.rollback()
        raise

    return {
        "success": True,
        "message": "Offer created successfully",
        "data": OfferResponse.model_validate(new_offer),
    }


@router.get("/service/{service_id}")
def get_service_offers(
    service_id: int,
    db: Session = Depends(get_db),
):
    offers = (
        db.query(Offer)
        .filter(Offer.service_id == service_id)
        .order_by(Offer.id.asc())
        .all()
    )

    return {
        "success": True,
        "data": [
            OfferResponse.model_validate(offer)
            for offer in offers
        ],
    }


@router.put("/{offer_id}")
def update_offer(
    offer_id: int,
    offer: OfferUpdate,
    db: Session = Depends(get_db),
):
    existing_offer = (
        db.query(Offer)
        .filter(Offer.id == offer_id)
        .first()
    )

    if existing_offer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found",
        )

    update_data = offer.model_dump(exclude_unset=True)

    next_min = update_data.get(
        "price_min",
        existing_offer.price_min,
    )
    next_max = update_data.get(
        "price_max",
        existing_offer.price_max,
    )

    if next_max < next_min:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "price_max must be greater than or equal "
                "to price_min"
            ),
        )

    for key, value in update_data.items():
        setattr(existing_offer, key, value)

    try:
        db.commit()
        db.refresh(existing_offer)
    except Exception:
        db.rollback()
        raise

    return {
        "success": True,
        "message": "Offer updated successfully",
        "data": OfferResponse.model_validate(existing_offer),
    }


@router.delete("/{offer_id}")
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
):
    existing_offer = (
        db.query(Offer)
        .filter(Offer.id == offer_id)
        .first()
    )

    if existing_offer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found",
        )

    try:
        db.delete(existing_offer)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "success": True,
        "message": "Offer deleted successfully",
    }