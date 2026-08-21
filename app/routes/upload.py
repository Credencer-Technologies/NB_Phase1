import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

router = APIRouter()

# --- Cloudinary setup (used for videos) ---
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)

# --- Local storage setup (used for images/PDFs) ---
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm"}

MAX_FILE_SIZE_MB = 10       # for images/PDFs
MAX_VIDEO_SIZE_MB = 100     # for videos


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    """
    Accepts a single file (multipart/form-data).

    - Images (.jpg, .jpeg, .png, .webp) and PDFs -> saved locally
      to static/uploads/, URL returned points to your own server.

    - Videos (.mp4, .mov, .webm) -> uploaded to Cloudinary,
      URL returned is the Cloudinary secure_url.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    contents = await file.read()

    # ---------------- VIDEO: send to Cloudinary ----------------
    if ext in ALLOWED_VIDEO_EXTENSIONS:
        if len(contents) > MAX_VIDEO_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"Video too large. Max {MAX_VIDEO_SIZE_MB}MB."
            )

        try:
            result = cloudinary.uploader.upload(
                contents,
                resource_type="video",
                folder="nari_bazar/videos",
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary upload failed: {str(e)}"
            )

        return {
            "success": True,
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "filename": file.filename,
            "size_bytes": len(contents),
        }

    # ---------------- IMAGE / PDF: save locally ----------------
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{ext}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS))}"
            )
        )

    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max {MAX_FILE_SIZE_MB}."
        )

    unique_name = f"{uuid.uuid4().hex}{ext}"
    destination = os.path.join(UPLOAD_DIR, unique_name)

    with open(destination, "wb") as f:
        f.write(contents)

    file_url = f"http://127.0.0.1:8000/static/uploads/{unique_name}"

    return {
        "success": True,
        "url": file_url,
        "filename": file.filename,
        "size_bytes": len(contents),
    }