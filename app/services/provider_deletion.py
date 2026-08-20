from datetime import datetime, timezone

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.enquiry import Enquiry
from app.models.favorite import Favorite
from app.models.offer import Offer
from app.models.portfolio import Portfolio
from app.models.provider import Provider
from app.models.review import Review
from app.models.service import Service


def utc_now_naive() -> datetime:
    """Return UTC now without tzinfo for the existing MySQL DATETIME columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _delete_provider_records(
    db: Session,
    provider: Provider,
) -> None:
    """Delete provider-owned rows in FK-safe order without committing."""

    provider_id = int(provider.id)

    service_ids = [
        row[0]
        for row in (
            db.query(Service.id)
            .filter(Service.provider_id == provider_id)
            .all()
        )
    ]

    if service_ids:
        db.query(Favorite).filter(
            Favorite.service_id.in_(service_ids)
        ).delete(synchronize_session=False)

        db.query(Offer).filter(
            Offer.service_id.in_(service_ids)
        ).delete(synchronize_session=False)

        db.query(Portfolio).filter(
            Portfolio.service_id.in_(service_ids)
        ).delete(synchronize_session=False)

        db.query(Review).filter(
            or_(
                Review.provider_id == provider_id,
                Review.service_id.in_(service_ids),
            )
        ).delete(synchronize_session=False)
    else:
        db.query(Review).filter(
            Review.provider_id == provider_id
        ).delete(synchronize_session=False)

    db.query(Enquiry).filter(
        Enquiry.provider_id == provider_id
    ).delete(synchronize_session=False)

    db.query(Service).filter(
        Service.provider_id == provider_id
    ).delete(synchronize_session=False)

    db.query(Provider).filter(
        Provider.id == provider_id
    ).delete(synchronize_session=False)


def permanently_delete_provider(
    db: Session,
    provider: Provider,
) -> None:
    """Permanently delete one provider and all provider-owned DB records."""

    try:
        _delete_provider_records(db, provider)
        db.commit()
    except Exception:
        db.rollback()
        raise


def purge_expired_provider_accounts(
    db: Session,
) -> int:
    """Hard-delete provider accounts whose 30-day grace period has expired."""

    now = utc_now_naive()

    expired = (
        db.query(Provider)
        .filter(
            Provider.deletion_requested_at.isnot(None),
            Provider.permanent_delete_at.isnot(None),
            Provider.permanent_delete_at <= now,
        )
        .all()
    )

    if not expired:
        return 0

    try:
        for provider in expired:
            _delete_provider_records(db, provider)

        db.commit()
        return len(expired)
    except Exception:
        db.rollback()
        raise