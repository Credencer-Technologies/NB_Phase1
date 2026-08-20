from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.schemas.category_schema import CategorySchema

router = APIRouter()


@router.post("/")
def create_category(
    category: CategorySchema,
    db: Session = Depends(get_db)
):

    new_category = Category(
        name=category.name,
        slug=category.slug,
        icon=category.icon,
        image_url=category.image_url,
        description=category.description
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "message": "Category created successfully",
        "category": new_category
    }


@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()