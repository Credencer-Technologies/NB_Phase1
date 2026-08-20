from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.enquiry import Enquiry
from app.models.service import Service
from app.schemas.enquiry_schema import EnquiryCreate, EnquiryResponse

router = APIRouter()

@router.post("/", response_model=EnquiryResponse)
def create_enquiry(
    enquiry: EnquiryCreate,
    db: Session = Depends(get_db)
):
    if enquiry.service_id is not None:
        service = (
            db.query(Service)
            .filter(Service.id == enquiry.service_id)
            .first()
        )

        if not service:
            raise HTTPException(
                status_code=404,
                detail="Service not found"
            )

        if int(service.provider_id) != int(enquiry.provider_id):
            raise HTTPException(
                status_code=400,
                detail="Selected service does not belong to this provider"
            )

    new_enquiry = Enquiry(
        provider_id=enquiry.provider_id,
        service_id=enquiry.service_id,
        user_id=enquiry.user_id,
        customer_name=enquiry.customer_name,
        customer_phone=enquiry.customer_phone,
        message=enquiry.message
    )

    db.add(new_enquiry)
    db.commit()
    db.refresh(new_enquiry)

    return new_enquiry


@router.get("/provider/{provider_id}")
def get_enquiries_by_provider(
    provider_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(Enquiry)
        .filter(Enquiry.provider_id == provider_id)
        .order_by(Enquiry.created_at.desc())
        .all()
    )