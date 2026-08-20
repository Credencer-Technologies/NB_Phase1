from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.favorite import Favorite
from app.models.service import Service
from app.schemas.favorite_schema import FavoriteCreate, FavoriteResponse

router = APIRouter()


def get_service_display_name(service: Service) -> str:
    custom_title = getattr(service, "custom_service_title", None)
    normal_name = getattr(service, "service_name", None)

    if custom_title and str(custom_title).strip():
        return str(custom_title).strip()

    if normal_name and str(normal_name).strip():
        return str(normal_name).strip()

    raise HTTPException(
        status_code=400,
        detail="Service name is missing in the services table",
    )


def get_category_name(service: Service, db: Session) -> str:
    category_id = getattr(service, "category_id", None)

    if not category_id:
        raise HTTPException(
            status_code=400,
            detail="This service does not have a category_id",
        )

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found for this service",
        )

    category_name = getattr(category, "name", None)

    if not category_name or not str(category_name).strip():
        raise HTTPException(
            status_code=400,
            detail="Category name is missing",
        )

    return str(category_name).strip()


@router.post("/", response_model=FavoriteResponse)
def add_favorite(
    favorite: FavoriteCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == favorite.user_id,
        Favorite.service_id == favorite.service_id,
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Service already in favorites",
        )

    service = db.query(Service).filter(
        Service.id == favorite.service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    service_name = get_service_display_name(service)
    category_name = get_category_name(service, db)

    new_favorite = Favorite(
        user_id=favorite.user_id,
        service_id=favorite.service_id,
        service_name=service_name,
        category_name=category_name,
    )

    try:
        db.add(new_favorite)
        db.commit()
        db.refresh(new_favorite)
        return new_favorite

    except SQLAlchemyError as error:
        db.rollback()
        print("Database error while adding favorite:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to add favorite",
        )


@router.get(
    "/user/{user_id}",
    response_model=list[FavoriteResponse],
)
def get_favorites(
    user_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.id.desc())
        .all()
    )


@router.delete("/{user_id}/{service_id}")
def remove_favorite(
    user_id: int,
    service_id: int,
    db: Session = Depends(get_db),
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.service_id == service_id,
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found",
        )

    try:
        db.delete(favorite)
        db.commit()

        return {
            "message": "Favorite removed successfully"
        }

    except SQLAlchemyError as error:
        db.rollback()
        print("Database error while removing favorite:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to remove favorite",
        )