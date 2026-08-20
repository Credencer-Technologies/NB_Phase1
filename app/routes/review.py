from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.provider import Provider
from app.models.review import Review
from app.models.service import Service
from app.schemas.review import ReviewCreate, ReviewUpdate


router = APIRouter()


def serialize_review(review: Review) -> dict:
    return {
        "id": review.id,
        "provider_id": review.provider_id,
        "service_id": review.service_id,
        "user_id": review.user_id,
        "customer_name": review.customer_name,
        "rating": review.rating,
        "review": review.review,
        "created_at": review.created_at,
    }


def rating_summary(
    db: Session,
    provider_id: int | None = None,
    service_id: int | None = None,
) -> dict:
    query = db.query(
        func.avg(Review.rating),
        func.count(Review.id),
    )

    if provider_id is not None:
        query = query.filter(
            Review.provider_id == provider_id
        )

    if service_id is not None:
        query = query.filter(
            Review.service_id == service_id
        )

    average, total = query.one()

    return {
        "average_rating": round(
            float(average or 0),
            1,
        ),
        "total_reviews": int(total or 0),
    }


def sync_provider_rating(
    db: Session,
    provider_id: int,
) -> None:
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if provider is None:
        return

    summary = rating_summary(
        db,
        provider_id=provider_id,
    )

    provider.avg_rating = summary[
        "average_rating"
    ]

    provider.ratings_count = summary[
        "total_reviews"
    ]


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
):
    service = (
        db.query(Service)
        .filter(Service.id == data.service_id)
        .first()
    )

    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    if int(service.provider_id) != int(
        data.provider_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "The selected service does not "
                "belong to this provider"
            ),
        )

    new_review = Review(
        provider_id=data.provider_id,
        service_id=data.service_id,
        user_id=data.user_id,
        customer_name=data.customer_name,
        rating=data.rating,
        review=data.review,
    )

    try:
        db.add(new_review)

        # Push INSERT before calculating provider
        # statistics, while keeping the same transaction.
        db.flush()

        sync_provider_rating(
            db,
            data.provider_id,
        )

        db.commit()
        db.refresh(new_review)

    except Exception as error:
        db.rollback()

        print(
            "CREATE REVIEW ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not save the review: "
                f"{str(error)}"
            ),
        ) from error

    return {
        "success": True,
        "message": "Review added successfully",
        "data": serialize_review(new_review),
        "service_summary": rating_summary(
            db,
            service_id=data.service_id,
        ),
        "provider_summary": rating_summary(
            db,
            provider_id=data.provider_id,
        ),
    }


@router.get("/service/{service_id}")
def get_service_reviews(
    service_id: int,
    db: Session = Depends(get_db),
):
    service = (
        db.query(Service)
        .filter(Service.id == service_id)
        .first()
    )

    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    try:
        reviews = (
            db.query(Review)
            .filter(
                Review.service_id == service_id
            )
            .order_by(
                Review.created_at.desc(),
                Review.id.desc(),
            )
            .all()
        )

        summary = rating_summary(
            db,
            service_id=service_id,
        )

    except Exception as error:
        print(
            "GET SERVICE REVIEWS ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not load service reviews: "
                f"{str(error)}"
            ),
        ) from error

    return {
        "success": True,
        "data": [
            serialize_review(item)
            for item in reviews
        ],
        "summary": summary,
    }


@router.get("/provider/{provider_id}")
def get_provider_reviews(
    provider_id: int,
    db: Session = Depends(get_db),
):
    provider = (
        db.query(Provider)
        .filter(Provider.id == provider_id)
        .first()
    )

    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found",
        )

    try:
        reviews = (
            db.query(Review)
            .filter(
                Review.provider_id == provider_id
            )
            .order_by(
                Review.created_at.desc(),
                Review.id.desc(),
            )
            .all()
        )

        summary = rating_summary(
            db,
            provider_id=provider_id,
        )

    except Exception as error:
        print(
            "GET PROVIDER REVIEWS ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not load provider reviews: "
                f"{str(error)}"
            ),
        ) from error

    return {
        "success": True,
        "data": [
            serialize_review(item)
            for item in reviews
        ],
        "summary": summary,
    }


@router.get(
    "/average/service/{service_id}"
)
def get_service_average(
    service_id: int,
    db: Session = Depends(get_db),
):
    try:
        summary = rating_summary(
            db,
            service_id=service_id,
        )

    except Exception as error:
        print(
            "GET SERVICE AVERAGE ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not calculate service "
                f"average: {str(error)}"
            ),
        ) from error

    return {
        "success": True,
        **summary,
    }


@router.get(
    "/average/provider/{provider_id}"
)
def get_provider_average(
    provider_id: int,
    db: Session = Depends(get_db),
):
    try:
        summary = rating_summary(
            db,
            provider_id=provider_id,
        )

    except Exception as error:
        print(
            "GET PROVIDER AVERAGE ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not calculate provider "
                f"average: {str(error)}"
            ),
        ) from error

    return {
        "success": True,
        **summary,
    }


@router.put("/{review_id}")
def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
):
    review = (
        db.query(Review)
        .filter(Review.id == review_id)
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if data.customer_name is not None:
        review.customer_name = (
            data.customer_name
        )

    if data.rating is not None:
        review.rating = data.rating

    if data.review is not None:
        review.review = data.review

    try:
        db.flush()

        sync_provider_rating(
            db,
            review.provider_id,
        )

        db.commit()
        db.refresh(review)

    except Exception as error:
        db.rollback()

        print(
            "UPDATE REVIEW ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not update the review: "
                f"{str(error)}"
            ),
        ) from error

    return {
        "success": True,
        "message": (
            "Review updated successfully"
        ),
        "data": serialize_review(review),
        "service_summary": rating_summary(
            db,
            service_id=review.service_id,
        ),
        "provider_summary": rating_summary(
            db,
            provider_id=review.provider_id,
        ),
    }


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
):
    review = (
        db.query(Review)
        .filter(Review.id == review_id)
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    provider_id = review.provider_id
    service_id = review.service_id

    try:
        db.delete(review)
        db.flush()

        sync_provider_rating(
            db,
            provider_id,
        )

        db.commit()

    except Exception as error:
        db.rollback()

        print(
            "DELETE REVIEW ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not delete the review: "
                f"{str(error)}"
            ),
        ) from error

    return {
        "success": True,
        "message": (
            "Review deleted successfully"
        ),
        "service_summary": rating_summary(
            db,
            service_id=service_id,
        ),
        "provider_summary": rating_summary(
            db,
            provider_id=provider_id,
        ),
    }