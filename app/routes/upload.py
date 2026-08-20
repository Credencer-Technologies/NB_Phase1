import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

# Where uploaded files physically live on disk. Created if missing.
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Keep this reasonably tight — images and ID documents only.
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
MAX_FILE_SIZE_MB = 10


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    """
    Accepts a single real file (multipart/form-data) — a cover image,
    a portfolio photo, or an ID document (image or PDF) — saves it to
    disk under static/uploads/, and returns a URL that can then be put
    into ProviderRegisterSchema.id_document_url or
    PortfolioUploadSchema.image_url.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB."
        )

    # Unique filename so two providers uploading "photo.jpg" don't collide.
    unique_name = f"{uuid.uuid4().hex}{ext}"
    destination = os.path.join(UPLOAD_DIR, unique_name)

    with open(destination, "wb") as f:
        f.write(contents)

    # This URL only works once main.py mounts the static files directory
    # (see the mount instructions in main.py below).
    file_url = f"http://127.0.0.1:8000/static/uploads/{unique_name}"

    return {
        "success": True,
        "url": file_url,
        "filename": file.filename,
        "size_bytes": len(contents),
    }
