from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.provider import Provider
from app.services.provider_deletion import utc_now_naive
from app.schemas.provider_schema import (
    ProviderRegisterSchema,
    ProviderUpdateSchema
)

router = APIRouter()


# =========================================================
# REGISTER PROVIDER
# =========================================================

@router.post("/register")
def register_provider(
    provider: ProviderRegisterSchema,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CLEAN EMAIL
    # -----------------------------------------------------

    clean_email = str(
        provider.email
    ).strip().lower()

    # -----------------------------------------------------
    # CHECK DUPLICATE EMAIL
    # -----------------------------------------------------

    existing_email = (
        db.query(Provider)
        .filter(
            Provider.email == clean_email
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # -----------------------------------------------------
    # CHECK DUPLICATE PHONE
    # ONLY IF PHONE WAS PROVIDED
    # -----------------------------------------------------

    if provider.phone:

        clean_phone = provider.phone.strip()

        existing_phone = (
            db.query(Provider)
            .filter(
                Provider.phone == clean_phone
            )
            .first()
        )

        if existing_phone:
            raise HTTPException(
                status_code=400,
                detail="Phone number already registered."
            )

    else:
        clean_phone = None

    # -----------------------------------------------------
    # CREATE NEW PROVIDER
    # -----------------------------------------------------

    new_provider = Provider(

        full_name=provider.full_name.strip(),

        phone=clean_phone,

        email=clean_email,

        city=provider.city.strip(),

        pin_code=provider.pin_code,

        category_id=provider.category_id,

        bio=provider.bio,

        service_description=provider.service_description,

        id_type=provider.id_type,

        id_document_url=provider.id_document_url,

        profile_image=provider.profile_image,

        # Every newly registered provider
        # must wait for admin approval.
        status="pending"
    )

    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)

    return {
        "success": True,
        "message": "Provider registered successfully",
        "provider_id": new_provider.id,
        "provider": new_provider
    }


# =========================================================
# GET PROVIDERS
# =========================================================

@router.get("/")
def get_providers(
    city: str = None,
    category_id: int = None,
    db: Session = Depends(get_db)
):

    # Public provider lists must immediately hide
    # accounts that requested deletion.
    query = db.query(Provider).filter(
        Provider.deletion_requested_at.is_(None)
    )

    if city:
        query = query.filter(
            Provider.city == city
        )

    if category_id:
        query = query.filter(
            Provider.category_id == category_id
        )

    return query.all()


# =========================================================
# FEATURED PROVIDERS
# =========================================================

@router.get("/featured")
def get_featured_providers(
    db: Session = Depends(get_db)
):

    return (
        db.query(Provider)
        .filter(
            Provider.status == "approved",
            Provider.deletion_requested_at.is_(None),
        )
        .limit(6)
        .all()
    )


# =========================================================
# GET PROVIDER BY ID
# =========================================================

@router.get("/{provider_id}")
def get_provider(
    provider_id: int,
    db: Session = Depends(get_db)
):

    provider = (
        db.query(Provider)
        .filter(
            Provider.id == provider_id,
            Provider.deletion_requested_at.is_(None),
        )
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    return provider


# =========================================================
# UPDATE PROVIDER
# =========================================================

@router.put("/{provider_id}")
def update_provider(
    provider_id: int,
    provider: ProviderUpdateSchema,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(Provider)
        .filter(
            Provider.id == provider_id,
            Provider.deletion_requested_at.is_(None),
        )
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    update_data = provider.model_dump(
        exclude_unset=True
    )

    # Normalize email if it is being updated.
    if "email" in update_data and update_data["email"] is not None:

        clean_email = str(
            update_data["email"]
        ).strip().lower()

        duplicate_email = (
            db.query(Provider)
            .filter(
                Provider.email == clean_email,
                Provider.id != provider_id
            )
            .first()
        )

        if duplicate_email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered."
            )

        update_data["email"] = clean_email

    for field, value in update_data.items():
        setattr(
            existing,
            field,
            value
        )

    db.commit()
    db.refresh(existing)

    return {
        "success": True,
        "message": "Provider updated successfully",
        "provider": existing
    }


# =========================================================
# DELETE PROVIDER
# =========================================================

@router.delete("/{provider_id}")
def delete_provider(
    provider_id: int,
    db: Session = Depends(get_db)
):

    provider = (
        db.query(Provider)
        .filter(
            Provider.id == provider_id
        )
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    # Hide immediately from Explore/public APIs,
    # but keep the database record for 30 days
    # so login during the grace period can restore it.
    if provider.deletion_requested_at is None:

        requested_at = utc_now_naive()

        provider.deletion_requested_at = requested_at

        provider.permanent_delete_at = (
            requested_at
            + timedelta(days=30)
        )

        db.commit()
        db.refresh(provider)

    return {
        "success": True,
        "message": (
            "Provider account scheduled for "
            "permanent deletion in 30 days"
        ),
        "provider_id": provider.id,
        "deletion_requested_at": (
            provider.deletion_requested_at
        ),
        "permanent_delete_at": (
            provider.permanent_delete_at
        ),
    }