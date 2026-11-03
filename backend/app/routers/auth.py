from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import get_db
from app.services.security_service import (
    authenticate_user,
    create_refresh_token,
    create_web_access_token,
    revoke_refresh_token,
    validate_refresh_token
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=schemas.TokenResponse
)
def login(
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):

    user = authenticate_user(
        db=db,
        username=login_data.username,
        password=login_data.password
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = create_web_access_token(
        user=user
    )

    refresh_token = create_refresh_token(
        db=db,
        user=user
    )

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post(
    "/refresh",
    response_model=schemas.TokenResponse
)
def refresh_access_token(
    token_data: schemas.RefreshTokenRequest,
    db: Session = Depends(get_db)
):

    db_token = validate_refresh_token(
        db=db,
        raw_token=token_data.refresh_token
    )

    if db_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user = (
        db.query(models.User)
        .filter(
            models.User.id == db_token.user_id
        )
        .first()
    )

    if user is None or not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    access_token = create_web_access_token(
        user=user
    )

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=token_data.refresh_token,
        token_type="bearer"
    )


@router.post(
    "/logout",
    response_model=schemas.MessageResponse
)
def logout(
    token_data: schemas.RefreshTokenRequest,
    db: Session = Depends(get_db)
):

    revoked = revoke_refresh_token(
        db=db,
        raw_token=token_data.refresh_token
    )

    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refresh token not found"
        )

    return schemas.MessageResponse(
        message="Session closed successfully"
    )
