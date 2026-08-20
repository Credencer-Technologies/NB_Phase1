from typing import Any, Optional
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import bindparam, inspect, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.enquiry import Enquiry
from app.models.favorite import Favorite
from app.models.offer import Offer
from app.models.portfolio import Portfolio
from app.models.provider import Provider
from app.models.review import Review
from app.models.service import Service
from app.models.user import User
from app.schemas.category_schema import CategorySchema

router = APIRouter()


class ProviderRejectRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=2000)


class AdminProviderUpdateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=10, max_length=15)
    category_id: Optional[int] = None
    city: str = Field(min_length=1, max_length=100)
    service_id: Optional[int] = None
    service_bio: Optional[str] = Field(default=None, max_length=5000)


def _category_name_map(db: Session) -> dict[int, str]:
    return {
        category.id: category.name
        for category in db.query(Category).all()
    }


def _provider_details_payload(
    provider: Provider,
    db: Session,
) -> dict[str, Any]:
    category_names = _category_name_map(db)

    services = (
        db.query(Service)
        .filter(Service.provider_id == provider.id)
        .order_by(Service.id.asc())
        .all()
    )

    service_payloads: list[dict[str, Any]] = []
    offer_count = 0
    portfolio_count = 0

    for service in services:
        offers = (
            db.query(Offer)
            .filter(Offer.service_id == service.id)
            .order_by(Offer.id.asc())
            .all()
        )

        portfolio_images = (
            db.query(Portfolio)
            .filter(Portfolio.service_id == service.id)
            .order_by(Portfolio.sort_order.asc(), Portfolio.id.asc())
            .all()
        )

        offer_count += len(offers)
        portfolio_count += len(portfolio_images)

        service_payloads.append(
            {
                "id": service.id,
                "provider_id": service.provider_id,
                "category_id": service.category_id,
                "category_name": category_names.get(
                    service.category_id,
                    "Uncategorized",
                ),
                "service_name": service.service_name,
                "custom_service_title": service.custom_service_title,
                "service_bio": service.service_bio,
                "service_profile_image": service.service_profile_image,
                "is_item_available": bool(service.is_item_available),
                "service_mode": service.service_mode,
                "created_at": service.created_at,
                "updated_at": service.updated_at,
                "offers": [
                    {
                        "id": offer.id,
                        "service_id": offer.service_id,
                        "offer_name": offer.offer_name,
                        "price_min": offer.price_min,
                        "price_max": offer.price_max,
                        "created_at": offer.created_at,
                        "updated_at": offer.updated_at,
                    }
                    for offer in offers
                ],
                "portfolio_images": [
                    {
                        "id": image.id,
                        "service_id": image.service_id,
                        "image_url": image.image_url,
                        "sort_order": image.sort_order,
                        "uploaded_at": image.uploaded_at,
                    }
                    for image in portfolio_images
                ],
            }
        )

    return {
        "id": provider.id,
        "full_name": provider.full_name,
        "phone": provider.phone,
        "email": provider.email,
        "city": provider.city,
        "pin_code": provider.pin_code,
        "category_id": provider.category_id,
        "category_name": category_names.get(
            provider.category_id,
            "Uncategorized",
        ),
        "bio": provider.bio,
        "service_description": provider.service_description,
        "id_type": provider.id_type,
        "id_document_url": provider.id_document_url,
        "status": provider.status,
        "rejection_reason": provider.rejection_reason,
        "is_available": bool(provider.is_available),
        "is_phone_verified": bool(provider.is_phone_verified),
        "avg_rating": provider.avg_rating,
        "ratings_count": provider.ratings_count,
        "completed_enquiries_count": provider.completed_enquiries_count,
        "profile_image": provider.profile_image,
        "created_at": provider.created_at,
        "updated_at": provider.updated_at,
        "service_count": len(service_payloads),
        "offer_count": offer_count,
        "portfolio_count": portfolio_count,
        "services": service_payloads,
    }


# ===============================
# GET ALL PROVIDERS
# ===============================
@router.get("/providers")
def get_all_providers(db: Session = Depends(get_db)):
    return (
        db.query(Provider)
        .order_by(Provider.created_at.desc(), Provider.id.desc())
        .all()
    )


# ===============================
# GET COMPLETE PROVIDER DETAILS
# ===============================
@router.get("/providers/{provider_id}/details")
def get_complete_provider_details(
    provider_id: int,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found",
        )

    return _provider_details_payload(provider, db)


# ===============================
# GET BASIC PROVIDER DETAILS
# ===============================
@router.get("/providers/{provider_id}")
def get_provider_details(
    provider_id: int,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found",
        )

    return provider


# ===============================
# UPDATE PROVIDER AS ADMIN
# Only this admin route can change the provider login phone number.
# ===============================
@router.put("/providers/{provider_id}")
def update_provider_as_admin(
    provider_id: int,
    payload: AdminProviderUpdateRequest,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found",
        )

    clean_name = payload.full_name.strip()
    clean_phone = re.sub(r"\s+", "", payload.phone.strip())
    clean_city = payload.city.strip()

    if not clean_name:
        raise HTTPException(
            status_code=400,
            detail="Provider name is required",
        )

    if not re.fullmatch(r"[0-9]{10,15}", clean_phone):
        raise HTTPException(
            status_code=400,
            detail="Phone number must contain 10 to 15 digits",
        )

    if not clean_city:
        raise HTTPException(
            status_code=400,
            detail="City is required",
        )

    duplicate_phone = (
        db.query(Provider)
        .filter(
            Provider.phone == clean_phone,
            Provider.id != provider_id,
        )
        .first()
    )

    if duplicate_phone:
        raise HTTPException(
            status_code=400,
            detail="This phone number is already registered to another provider",
        )

    if payload.category_id is not None:
        category = (
            db.query(Category)
            .filter(Category.id == payload.category_id)
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found",
            )

    provider.full_name = clean_name
    provider.phone = clean_phone
    provider.city = clean_city
    provider.category_id = payload.category_id

    selected_service = None

    if payload.service_id is not None:
        selected_service = (
            db.query(Service)
            .filter(
                Service.id == payload.service_id,
                Service.provider_id == provider_id,
            )
            .first()
        )

        if not selected_service:
            raise HTTPException(
                status_code=404,
                detail="The selected service does not belong to this provider",
            )
    else:
        selected_service = (
            db.query(Service)
            .filter(Service.provider_id == provider_id)
            .order_by(Service.id.asc())
            .first()
        )

    if payload.service_bio is not None:
        clean_service_bio = payload.service_bio.strip()
        provider.service_description = clean_service_bio or None

        if selected_service:
            selected_service.service_bio = clean_service_bio or None

    # Keep the primary service category aligned with the registration category.
    if selected_service and payload.category_id is not None:
        selected_service.category_id = payload.category_id

    try:
        db.commit()
        db.refresh(provider)

        return {
            "message": (
                "Provider details updated successfully. "
                "The new phone number will be used for future logins."
            ),
            "provider": _provider_details_payload(provider, db),
        }
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update provider details",
        ) from error


# ===============================
# APPROVE / RE-APPROVE PROVIDER
# ===============================
@router.put("/providers/{provider_id}/approve")
def approve_provider(
    provider_id: int,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found",
        )

    provider.status = "approved"
    provider.rejection_reason = None

    db.commit()
    db.refresh(provider)

    return {
        "message": "Provider approved successfully",
        "provider": provider,
    }


# ===============================
# REJECT PROVIDER
# Pending or approved providers may be rejected.
# ===============================
@router.put("/providers/{provider_id}/reject")
def reject_provider(
    provider_id: int,
    payload: ProviderRejectRequest,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found",
        )

    reason = payload.reason.strip()

    if not reason:
        raise HTTPException(
            status_code=400,
            detail="Rejection reason is required",
        )

    provider.status = "rejected"
    provider.rejection_reason = reason

    db.commit()
    db.refresh(provider)

    return {
        "message": "Provider rejected successfully",
        "provider": provider,
    }


# ===============================
# DELETE PROVIDER AND RELATED DATA
# ===============================
@router.delete("/providers/{provider_id}")
def delete_provider_and_related_data(
    provider_id: int,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found",
        )

    try:
        service_rows = (
            db.query(Service.id)
            .filter(Service.provider_id == provider_id)
            .all()
        )
        service_ids = [row[0] for row in service_rows]

        # Delete rows linked directly to the provider.
        db.query(Review).filter(
            Review.provider_id == provider_id
        ).delete(synchronize_session=False)

        db.query(Enquiry).filter(
            Enquiry.provider_id == provider_id
        ).delete(synchronize_session=False)

        # Delete rows linked through services.
        if service_ids:
            db.query(Favorite).filter(
                Favorite.service_id.in_(service_ids)
            ).delete(synchronize_session=False)

            db.query(Portfolio).filter(
                Portfolio.service_id.in_(service_ids)
            ).delete(synchronize_session=False)

            db.query(Offer).filter(
                Offer.service_id.in_(service_ids)
            ).delete(synchronize_session=False)

            # This also covers review rows whose provider_id may be incorrect
            # but whose service still belongs to this provider.
            db.query(Review).filter(
                Review.service_id.in_(service_ids)
            ).delete(synchronize_session=False)

        # Support older tables that may still exist in the database but do not
        # have SQLAlchemy models in this project.
        inspector = inspect(db.bind)
        table_names = set(inspector.get_table_names())

        if "wishlist" in table_names:
            wishlist_columns = {
                column["name"]
                for column in inspector.get_columns("wishlist")
            }

            if "provider_id" in wishlist_columns:
                db.execute(
                    text(
                        "DELETE FROM wishlist "
                        "WHERE provider_id = :provider_id"
                    ),
                    {"provider_id": provider_id},
                )

            if service_ids and "service_id" in wishlist_columns:
                statement = text(
                    "DELETE FROM wishlist "
                    "WHERE service_id IN :service_ids"
                ).bindparams(
                    bindparam("service_ids", expanding=True)
                )
                db.execute(statement, {"service_ids": service_ids})

        if "provider_availability" in table_names:
            availability_columns = {
                column["name"]
                for column in inspector.get_columns(
                    "provider_availability"
                )
            }

            if "provider_id" in availability_columns:
                db.execute(
                    text(
                        "DELETE FROM provider_availability "
                        "WHERE provider_id = :provider_id"
                    ),
                    {"provider_id": provider_id},
                )

            if service_ids and "service_id" in availability_columns:
                statement = text(
                    "DELETE FROM provider_availability "
                    "WHERE service_id IN :service_ids"
                ).bindparams(
                    bindparam("service_ids", expanding=True)
                )
                db.execute(statement, {"service_ids": service_ids})

        # Some older database versions used service_offers instead of offers.
        if service_ids and "service_offers" in table_names:
            old_offer_columns = {
                column["name"]
                for column in inspector.get_columns("service_offers")
            }

            if "service_id" in old_offer_columns:
                statement = text(
                    "DELETE FROM service_offers "
                    "WHERE service_id IN :service_ids"
                ).bindparams(
                    bindparam("service_ids", expanding=True)
                )
                db.execute(statement, {"service_ids": service_ids})

        db.query(Service).filter(
            Service.provider_id == provider_id
        ).delete(synchronize_session=False)

        db.delete(provider)
        db.commit()

        return {
            "message": "Provider and all related records deleted successfully",
            "provider_id": provider_id,
        }

    except Exception as error:
        db.rollback()
        print("Provider deletion error:", str(error))

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to delete provider. "
                "Check the backend terminal for the related table error."
            ),
        ) from error


# ===============================
# DASHBOARD STATS
# ===============================
@router.get("/stats")
def admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_providers = db.query(Provider).count()

    approved_providers = (
        db.query(Provider)
        .filter(Provider.status == "approved")
        .count()
    )

    rejected_providers = (
        db.query(Provider)
        .filter(Provider.status == "rejected")
        .count()
    )

    pending_providers = (
        db.query(Provider)
        .filter(Provider.status == "pending")
        .count()
    )

    total_services = db.query(Service).count()
    total_categories = db.query(Category).count()

    return {
        "total_users": total_users,
        "total_providers": total_providers,
        "approved_providers": approved_providers,
        "rejected_providers": rejected_providers,
        "pending_providers": pending_providers,
        "total_services": total_services,
        "total_categories": total_categories,
    }


# ===============================
# GET ALL CATEGORIES
# ===============================
@router.get("/categories")
def get_all_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()


# ===============================
# ADD CATEGORY
# ===============================
@router.post("/categories")
def add_category(
    category: CategorySchema,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Category)
        .filter(Category.slug == category.slug)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists",
        )

    new_category = Category(
        name=category.name,
        slug=category.slug,
        icon=category.icon,
        image_url=category.image_url,
        description=category.description,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "message": "Category added successfully",
        "category": new_category,
    }


# ===============================
# UPDATE CATEGORY
# ===============================
@router.put("/categories/{category_id}")
def update_category(
    category_id: int,
    category: CategorySchema,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    duplicate_slug = (
        db.query(Category)
        .filter(
            Category.slug == category.slug,
            Category.id != category_id,
        )
        .first()
    )

    if duplicate_slug:
        raise HTTPException(
            status_code=400,
            detail="Another category already uses this name",
        )

    existing.name = category.name
    existing.slug = category.slug
    existing.icon = category.icon
    existing.image_url = category.image_url
    existing.description = category.description

    db.commit()
    db.refresh(existing)

    return {
        "message": "Category updated successfully",
        "category": existing,
    }

# ===============================
# DELETE CATEGORY
# ===============================
@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    try:
        # Keep existing providers/services safe.
        # If this category is currently assigned anywhere,
        # remove only the category reference instead of deleting
        # provider/service records.
        db.query(Provider).filter(
            Provider.category_id == category_id
        ).update(
            {Provider.category_id: None},
            synchronize_session=False,
        )

        db.query(Service).filter(
            Service.category_id == category_id
        ).update(
            {Service.category_id: None},
            synchronize_session=False,
        )

        db.delete(category)
        db.commit()

        return {
            "success": True,
            "message": "Category deleted successfully",
            "category_id": category_id,
        }

    except Exception as error:
        db.rollback()

        print(
            "Category deletion error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete category",
        ) from error
