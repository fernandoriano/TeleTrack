from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from sqlalchemy.orm import Session

from app import models
from app.auth import (
    create_access_token,
    hash_password,
    verify_password
)
from app.config import settings


def authenticate_user(
    db: Session,
    username: str,
    password: str
) -> models.User | None:
    user = (
        db.query(models.User)
        .filter(models.User.username == username)
        .first()
    )

    if user is None:
        return None

    if not user.active:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user


def create_web_access_token(
    user: models.User
) -> str:
    return create_access_token(
        username=user.username,
        role=user.role,
        client_id=user.client_id
    )


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def create_refresh_token(
    db: Session,
    user: models.User
) -> str:
    raw_token = generate_refresh_token()

    token_hash = hash_token(
        raw_token
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            days=settings.refresh_token_expire_days
        )
    )

    db_token = models.RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        revoked=False
    )

    db.add(db_token)
    db.commit()
    db.refresh(db_token)

    return raw_token


def validate_refresh_token(
    db: Session,
    raw_token: str
) -> models.RefreshToken | None:
    token_hash = hash_token(
        raw_token
    )

    db_token = (
        db.query(models.RefreshToken)
        .filter(
            models.RefreshToken.token_hash
            == token_hash
        )
        .first()
    )

    if db_token is None:
        return None

    if db_token.revoked:
        return None

    now = datetime.now(timezone.utc)

    if db_token.expires_at < now:
        return None

    return db_token


def revoke_refresh_token(
    db: Session,
    raw_token: str
) -> bool:
    token_hash = hash_token(
        raw_token
    )

    db_token = (
        db.query(models.RefreshToken)
        .filter(
            models.RefreshToken.token_hash
            == token_hash
        )
        .first()
    )

    if db_token is None:
        return False

    db_token.revoked = True

    db.commit()

    return True


def generate_activation_secret() -> str:
    return secrets.token_urlsafe(24)


def hash_activation_secret(
    activation_secret: str
) -> str:
    return hash_password(
        activation_secret
    )


def verify_activation_secret(
    activation_secret: str,
    stored_hash: str
) -> bool:
    return verify_password(
        activation_secret,
        stored_hash
    )


def generate_device_token() -> str:
    return secrets.token_urlsafe(48)


def hash_device_token(
    token: str
) -> str:
    return hash_token(
        token
    )


def verify_device_token(
    token: str,
    stored_hash: str
) -> bool:
    return secrets.compare_digest(
        hash_device_token(token),
        stored_hash
    )
