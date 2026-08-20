from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.service import Service
from app.models.provider import Provider
from app.models.category import Category
from app.schemas.service_schema import (
    ServiceCreateSchema,
    ServiceUpdateSchema
)

router = APIRouter()


# ----------------------------
# Create Service
# ----------------------------
@router.post("/")
def create_service(
    service: ServiceCreateSchema,
    db: Session = Depends(get_db)
):

    # Check Provider Exists
    provider = db.query(Provider).filter(
        Provider.id == service.provider_id,
        Provider.deletion_requested_at.is_(None),
    ).first()

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    # Check Category Exists (only if a category was actually provided —
    # category_id is optional, so None should not be treated as invalid)
    if service.category_id is not None:
        category = db.query(Category).filter(
            Category.id == service.category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

    new_service = Service(
    provider_id=service.provider_id,
    category_id=service.category_id,
    service_name=service.service_name,
    custom_service_title=service.custom_service_title,
    service_bio=service.service_bio,
    service_profile_image=service.service_profile_image,
    is_item_available=service.is_item_available,
    service_mode=service.service_mode
)

    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return {
        "message": "Service Added Successfully",
        "data": new_service
    }


# ----------------------------
# Get All Services
# ----------------------------
@router.get("/")
def get_all_services(
    db: Session = Depends(get_db)
):
    # Explore uses this endpoint. A pending-deletion provider keeps her DB
    # data for 30 days, but none of her service cards are returned publicly.
    return (
        db.query(Service)
        .join(Provider, Provider.id == Service.provider_id)
        .filter(Provider.deletion_requested_at.is_(None))
        .all()
    )


# ----------------------------
# Get Services By Provider
# ----------------------------
@router.get("/provider/{provider_id}")
def get_services_by_provider(
    provider_id: int,
    db: Session = Depends(get_db)
):

    provider = db.query(Provider).filter(
        Provider.id == provider_id,
        Provider.deletion_requested_at.is_(None),
    ).first()

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    services = db.query(Service).filter(
        Service.provider_id == provider_id
    ).all()

    return services


# ----------------------------
# Get Single Service
# ----------------------------
@router.get("/{service_id}")
def get_service(
    service_id: int,
    db: Session = Depends(get_db)
):

    service = (
        db.query(Service)
        .join(Provider, Provider.id == Service.provider_id)
        .filter(
            Service.id == service_id,
            Provider.deletion_requested_at.is_(None),
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found"
        )

    return service


# ----------------------------
# Update Service
# ----------------------------
@router.put("/{service_id}")
def update_service(
    service_id: int,
    service: ServiceUpdateSchema,
    db: Session = Depends(get_db)
):

    db_service = (
        db.query(Service)
        .join(Provider, Provider.id == Service.provider_id)
        .filter(
            Service.id == service_id,
            Provider.deletion_requested_at.is_(None),
        )
        .first()
    )

    if not db_service:
        raise HTTPException(
            status_code=404,
            detail="Service not found"
        )

    # Validate Category (only if category_id is provided)
    if service.category_id is not None:
        category = db.query(Category).filter(
            Category.id == service.category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        db_service.category_id = service.category_id

    db_service.service_name = service.service_name
    db_service.custom_service_title = service.custom_service_title
    db_service.service_bio = service.service_bio
    db_service.service_profile_image = service.service_profile_image
    db_service.is_item_available = service.is_item_available
    db_service.service_mode = service.service_mode

    db.commit()
    db.refresh(db_service)

    return {
        "message": "Service Updated Successfully",
        "data": db_service
    }

# ----------------------------
# Delete Service
# ----------------------------
@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db)
):

    service = (
        db.query(Service)
        .join(Provider, Provider.id == Service.provider_id)
        .filter(
            Service.id == service_id,
            Provider.deletion_requested_at.is_(None),
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found"
        )

    db.delete(service)
    db.commit()

    return {
        "message": "Service Deleted Successfully"
    }

