from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserRegisterSchema

router = APIRouter()


@router.post("/register")
def register_user(
    data: UserRegisterSchema,
    db: Session = Depends(get_db)
):

    clean_name = data.full_name.strip()
    clean_email = str(data.email).strip().lower()
    clean_phone = data.phone.strip()

    if not clean_name:
        raise HTTPException(
            status_code=400,
            detail="Full name is required."
        )

    if not clean_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number is required."
        )

    if not clean_phone.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Phone number must contain only digits."
        )

    if len(clean_phone) != 10:
        raise HTTPException(
            status_code=400,
            detail="Phone number must contain exactly 10 digits."
        )

    existing_user = db.query(User).filter(
        User.email == clean_email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    existing_phone = db.query(User).filter(
        User.phone == clean_phone
    ).first()

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered."
        )

    user = User(
    full_name=data.full_name.strip(),
    email=clean_email,
    phone=data.phone.strip(),
    otp=""
)

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "User registered successfully",
        "user_id": user.id,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone
        }
    }


@router.get("/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone
    }


@router.get("/phone/{phone}")
def get_user_by_phone(
    phone: str,
    db: Session = Depends(get_db)
):

    clean_phone = phone.strip()

    user = db.query(User).filter(
        User.phone == clean_phone
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone
    }