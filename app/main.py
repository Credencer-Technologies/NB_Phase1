import asyncio
from contextlib import suppress
from pathlib import Path
from uuid import uuid4
import shutil

import cloudinary
import cloudinary.uploader

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.database import Base, SessionLocal, engine
from app.config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# Import models so SQLAlchemy knows about every table.
from app.models.provider import Provider
from app.models.category import Category
from app.models.enquiry import Enquiry
from app.models.portfolio import Portfolio
from app.models.service import Service
from app.models.review import Review
from app.models.offer import Offer
from app.models.favorite import Favorite
from app.services.provider_deletion import purge_expired_provider_accounts

# Import routers.
from app.routes.auth import router as auth_router
from app.routes.users import router as user_router
from app.routes.providers import router as provider_router
from app.routes.categories import router as category_router
from app.routes.enquiry import router as enquiry_router
from app.routes.portfolio import router as portfolio_router
from app.routes.services import router as service_router
from app.routes.admin import router as admin_router
from app.routes.review import router as review_router
from app.routes.offers import router as offer_router
from app.routes.favorite import router as favorite_router


# ---------------------------------------------------------
# TEMPORARILY DISABLED — MySQL is not set up on this machine yet.
# Re-enable these three lines once MySQL/XAMPP is running.
# ---------------------------------------------------------

# Base.metadata.create_all(bind=engine)


def ensure_provider_deletion_columns():
    """Add the 30-day deletion columns to an existing providers table."""

    inspector = inspect(engine)

    if "providers" not in inspector.get_table_names():
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("providers")
    }

    statements = []

    if "deletion_requested_at" not in existing_columns:
        statements.append(
            "ALTER TABLE providers "
            "ADD COLUMN deletion_requested_at DATETIME NULL"
        )

    if "permanent_delete_at" not in existing_columns:
        statements.append(
            "ALTER TABLE providers "
            "ADD COLUMN permanent_delete_at DATETIME NULL"
        )

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


# create_all() does not ALTER an existing table, so add the two columns once
# for databases that were created before this feature existed.
# ensure_provider_deletion_columns()


def ensure_enquiry_service_column():
    """Add service_id to older enquiries tables for service-wise enquiries."""

    inspector = inspect(engine)

    if "enquiries" not in inspector.get_table_names():
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("enquiries")
    }

    if "service_id" in existing_columns:
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE enquiries "
                "ADD COLUMN service_id INT UNSIGNED NULL AFTER provider_id"
            )
        )


# ensure_enquiry_service_column()


app = FastAPI(
    title="Nari Bazar API",
    description="Backend APIs for the Nari Bazar platform",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Cloudinary configuration (used for video uploads)
# ---------------------------------------------------------

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)


# ---------------------------------------------------------
# 30-day provider deletion cleanup
# ---------------------------------------------------------

_provider_cleanup_task = None


async def cleanup_expired_provider_accounts_loop():
    while True:
        db = SessionLocal()

        try:
            deleted_count = purge_expired_provider_accounts(db)

            if deleted_count:
                print(
                    f"Permanently deleted {deleted_count} expired provider account(s)."
                )
        except Exception as error:
            print(
                "Provider deletion cleanup failed:",
                repr(error),
            )
        finally:
            db.close()

        await asyncio.sleep(60 * 60)


@app.on_event("startup")
async def start_provider_deletion_cleanup():
    global _provider_cleanup_task

    _provider_cleanup_task = asyncio.create_task(
        cleanup_expired_provider_accounts_loop()
    )


@app.on_event("shutdown")
async def stop_provider_deletion_cleanup():
    global _provider_cleanup_task

    if _provider_cleanup_task is None:
        return

    _provider_cleanup_task.cancel()

    with suppress(asyncio.CancelledError):
        await _provider_cleanup_task


# ---------------------------------------------------------
# File upload configuration
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIRECTORY = BASE_DIR / "static" / "uploads"
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static",
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf",
}

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/webm",
}

MAX_FILE_SIZE = 10 * 1024 * 1024        # 10 MB — images/PDFs
MAX_VIDEO_SIZE = 100 * 1024 * 1024      # 100 MB — videos


@app.post("/api/v1/upload", tags=["Upload"])
async def upload_file(file: UploadFile = File(...)):
    """
    Upload provider profile images, portfolio images, ID documents,
    and videos.

    Frontend sends multipart/form-data using field name: file

    - Images (JPG/PNG/WEBP) and PDFs -> saved locally, response:
      { "url": "http://127.0.0.1:8000/static/uploads/example.jpg" }

    - Videos (MP4/MOV/WEBM) -> uploaded to Cloudinary, response:
      { "url": "https://res.cloudinary.com/.../example.mp4" }
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected.",
        )

    # ---------------- VIDEO: send to Cloudinary ----------------
    if file.content_type in ALLOWED_VIDEO_TYPES:
        file_bytes = await file.read()

        if len(file_bytes) > MAX_VIDEO_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Video size must not exceed 100 MB.",
            )

        try:
            result = cloudinary.uploader.upload(
                file_bytes,
                resource_type="video",
                folder="nari_bazar/videos",
            )
        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary upload failed: {str(error)}",
            ) from error

        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "url": result["secure_url"],
            "public_id": result["public_id"],
        }

    # ---------------- IMAGE / PDF: keep existing local storage logic ----------------
    allowed_types = ALLOWED_IMAGE_TYPES | ALLOWED_DOCUMENT_TYPES

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Only JPG, JPEG, PNG, WEBP, PDF and MP4/MOV/WEBM files are allowed."
            ),
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 10 MB.",
        )

    original_extension = Path(file.filename).suffix.lower()

    if not original_extension:
        extension_map = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "application/pdf": ".pdf",
        }

        original_extension = extension_map.get(
            file.content_type,
            "",
        )

    unique_filename = f"{uuid4().hex}{original_extension}"
    destination = UPLOAD_DIRECTORY / unique_filename

    try:
        with destination.open("wb") as output_file:
            output_file.write(file_bytes)
    except OSError as error:
        raise HTTPException(
            status_code=500,
            detail="Unable to save uploaded file.",
        ) from error

    return {
        "message": "File uploaded successfully",
        "filename": unique_filename,
        "url": (
            "http://127.0.0.1:8000"
            f"/static/uploads/{unique_filename}"
        ),
    }


# ---------------------------------------------------------
# API routers
# ---------------------------------------------------------

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

app.include_router(
    user_router,
    prefix="/api/v1/users",
    tags=["Users"],
)

app.include_router(
    provider_router,
    prefix="/api/v1/providers",
    tags=["Providers"],
)

app.include_router(
    category_router,
    prefix="/api/v1/categories",
    tags=["Categories"],
)

app.include_router(
    enquiry_router,
    prefix="/api/v1/enquiries",
    tags=["Enquiries"],
)

app.include_router(
    portfolio_router,
    prefix="/api/v1/portfolio",
    tags=["Portfolio"],
)

app.include_router(
    service_router,
    prefix="/api/v1/services",
    tags=["Services"],
)

app.include_router(
    admin_router,
    prefix="/api/v1/admin",
    tags=["Admin"],
)

app.include_router(
    review_router,
    prefix="/api/v1/reviews",
    tags=["Reviews"],
)

# offer_router already has prefix="/offers".
# Therefore adding "/api/v1" here creates "/api/v1/offers".
app.include_router(
    offer_router,
    prefix="/api/v1",
)

app.include_router(
    favorite_router,
    prefix="/api/v1/favorites",
    tags=["Favorites"],
)


@app.get("/")
def home():
    return {
        "message": "NaariBazar Backend Running",
    }