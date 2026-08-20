from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.portfolio import Portfolio
from app.models.service import Service
from app.schemas.portfolio_schema import PortfolioUploadSchema

router = APIRouter()


# ----------------------------
# Upload Portfolio Image
# ----------------------------
@router.post("/upload")
def upload_portfolio(
    data: PortfolioUploadSchema,
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(
        Service.id == data.service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found"
        )

    portfolio = Portfolio(
        service_id=data.service_id,
        image_url=data.image_url,
        sort_order=data.sort_order
    )

    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    return {
        "success": True,
        "message": "Portfolio uploaded successfully",
        "data": {
            "id": portfolio.id,
            "service_id": portfolio.service_id,
            "image_url": portfolio.image_url,
            "sort_order": portfolio.sort_order,
        }
    }


# ----------------------------
# Get Portfolio Images by Service
# (used by Provider Dashboard — each service card shows only its own
# portfolio samples)
# ----------------------------
@router.get("/service/{service_id}")
def get_service_portfolio(
    service_id: int,
    db: Session = Depends(get_db)
):
    images = (
        db.query(Portfolio)
        .filter(Portfolio.service_id == service_id)
        .order_by(Portfolio.sort_order)
        .all()
    )

    data = [
        {
            "id": img.id,
            "service_id": img.service_id,
            "image_url": img.image_url,
            "sort_order": img.sort_order,
        }
        for img in images
    ]

    return {"success": True, "data": data}


# ----------------------------
# Get Portfolio Images by Provider
# (used by public Provider Profile page — combines images across all of
# that provider's services)
# ----------------------------
@router.get("/provider/{provider_id}")
def get_provider_portfolio(
    provider_id: int,
    db: Session = Depends(get_db)
):
    services = db.query(Service).filter(
        Service.provider_id == provider_id
    ).all()

    if not services:
        return {"success": True, "data": []}

    service_ids = [s.id for s in services]

    images = (
        db.query(Portfolio)
        .filter(Portfolio.service_id.in_(service_ids))
        .order_by(Portfolio.service_id, Portfolio.sort_order)
        .all()
    )

    data = [
        {
            "id": img.id,
            "service_id": img.service_id,
            "image_url": img.image_url,
            "sort_order": img.sort_order,
        }
        for img in images
    ]

    return {"success": True, "data": data}


# ----------------------------
# Delete Portfolio Image
# ----------------------------
@router.delete("/{image_id}")
def delete_portfolio(
    image_id: int,
    db: Session = Depends(get_db)
):
    image = db.query(Portfolio).filter(
        Portfolio.id == image_id
    ).first()

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Portfolio image not found"
        )

    db.delete(image)
    db.commit()

    return {
        "success": True,
        "message": "Portfolio image deleted successfully"
    }