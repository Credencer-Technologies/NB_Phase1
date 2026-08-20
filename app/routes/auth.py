import os
import smtplib
import secrets
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.provider import Provider
from app.models.user import User
from app.schemas.auth_schema import SendOTPSchema, VerifyOTPSchema
from app.services.provider_deletion import utc_now_naive

load_dotenv(override=True)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.hostinger.com").strip()
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "true").strip().lower() in (
    "1", "true", "yes", "on"
)

OTP_EXPIRY_SECONDS = 300
SMTP_TIMEOUT_SECONDS = 20

router = APIRouter()
generated_otps = {}


def normalize_email(email: str) -> str:
    return str(email).strip().lower()


def generate_otp() -> str:
    return f"{secrets.randbelow(1000000):06d}"


def build_otp_message(receiver_email: str, otp: str) -> MIMEMultipart:
    message = MIMEMultipart("alternative")
    message["Subject"] = "NaariBazar Email Verification OTP"
    message["From"] = SMTP_EMAIL
    message["To"] = receiver_email

    text_body = f"""Hello,

Your NaariBazar verification OTP is: {otp}

This OTP is valid for 5 minutes.

Please do not share this OTP with anyone.

Regards,
NaariBazar Team
"""

    html_body = f"""
    <html>
      <body style="font-family:Arial,sans-serif;background:#f7f3fb;padding:24px;">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:16px;padding:28px;">
          <h2 style="color:#7E22CE;">NaariBazar Email Verification</h2>
          <p>Use the OTP below to verify your email address.</p>
          <div style="margin:24px 0;padding:16px;text-align:center;border-radius:12px;background:#f5eefe;color:#7E22CE;font-size:30px;font-weight:700;letter-spacing:8px;">
            {otp}
          </div>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>Please do not share this OTP with anyone.</p>
          <p>Regards,<br><strong>NaariBazar Team</strong></p>
        </div>
      </body>
    </html>
    """

    message.attach(MIMEText(text_body, "plain"))
    message.attach(MIMEText(html_body, "html"))
    return message


def send_using_ssl(receiver_email: str, message: MIMEMultipart) -> None:
    with smtplib.SMTP_SSL(
        SMTP_HOST,
        465,
        timeout=SMTP_TIMEOUT_SECONDS,
    ) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(
            SMTP_EMAIL,
            receiver_email,
            message.as_string(),
        )


def send_using_starttls(receiver_email: str, message: MIMEMultipart) -> None:
    with smtplib.SMTP(
        SMTP_HOST,
        587,
        timeout=SMTP_TIMEOUT_SECONDS,
    ) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(
            SMTP_EMAIL,
            receiver_email,
            message.as_string(),
        )


def send_otp_email(receiver_email: str, otp: str) -> None:
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_EMAIL or SMTP_PASSWORD is missing from .env"
        )

    message = build_otp_message(receiver_email, otp)

    if SMTP_USE_SSL or SMTP_PORT == 465:
        attempts = [
            ("SSL 465", send_using_ssl),
            ("STARTTLS 587", send_using_starttls),
        ]
    else:
        attempts = [
            ("STARTTLS 587", send_using_starttls),
            ("SSL 465", send_using_ssl),
        ]

    errors = []

    for label, sender in attempts:
        try:
            print(f"Trying SMTP via {label}...")
            sender(receiver_email, message)
            print(
                f"OTP email sent successfully to "
                f"{receiver_email} via {label}"
            )
            return
        except Exception as exc:
            print(
                f"SMTP {label} failed: "
                f"{type(exc).__name__}: {exc}"
            )
            errors.append(
                f"{label}: {type(exc).__name__}: {exc}"
            )

    raise RuntimeError(
        "All SMTP connection attempts failed. "
        + " | ".join(errors)
    )


def cleanup_expired_otps() -> None:
    now = time.time()

    expired_emails = [
        email
        for email, data in generated_otps.items()
        if now - data["created_at"] > OTP_EXPIRY_SECONDS
    ]

    for email in expired_emails:
        generated_otps.pop(email, None)


@router.post("/send-otp")
def send_otp(data: SendOTPSchema):
    clean_email = normalize_email(data.email)

    if not clean_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email is required.",
        )

    cleanup_expired_otps()
    otp = generate_otp()

    try:
        send_otp_email(clean_email, otp)
    except Exception as exc:
        print(
            "SMTP Email Error:",
            f"{type(exc).__name__}: {exc}",
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Unable to send OTP email. "
                "Please check Wi-Fi/SMTP access or try another network."
            ),
        )

    generated_otps[clean_email] = {
        "otp": otp,
        "created_at": time.time(),
    }

    return {
        "success": True,
        "message": "OTP sent to your email successfully",
        "expires_in_seconds": OTP_EXPIRY_SECONDS,
    }


@router.post("/verify-otp")
def verify_otp(
    data: VerifyOTPSchema,
    db: Session = Depends(get_db),
):
    clean_email = normalize_email(data.email)
    clean_otp = str(data.otp).strip()

    cleanup_expired_otps()

    stored = generated_otps.get(clean_email)

    if not stored:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "OTP not found or expired. "
                "Please request a new OTP."
            ),
        )

    if time.time() - stored["created_at"] > OTP_EXPIRY_SECONDS:
        generated_otps.pop(clean_email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "OTP has expired. "
                "Please request a new OTP."
            ),
        )

    if not secrets.compare_digest(
        str(stored["otp"]),
        clean_otp,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    provider = (
        db.query(Provider)
        .filter(Provider.email == clean_email)
        .first()
    )

    if provider:
        generated_otps.pop(clean_email, None)

        if provider.deletion_requested_at is not None:
            now = utc_now_naive()
            can_restore = (
                provider.permanent_delete_at is None
                or now < provider.permanent_delete_at
            )

            if can_restore:
                provider.deletion_requested_at = None
                provider.permanent_delete_at = None
                db.commit()
                db.refresh(provider)

        return {
            "success": True,
            "message": "OTP verified successfully",
            "role": "provider",
            "account_id": provider.id,
            "provider_id": provider.id,
            "full_name": provider.full_name,
            "email": provider.email,
            "phone": provider.phone,
            "status": provider.status,
        }

    user = (
        db.query(User)
        .filter(User.email == clean_email)
        .first()
    )

    if user:
        generated_otps.pop(clean_email, None)

        return {
            "success": True,
            "message": "OTP verified successfully",
            "role": "user",
            "account_id": user.id,
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
        }

    return {
        "success": True,
        "message": "OTP verified successfully",
        "role": "unregistered",
        "email": clean_email,
    }