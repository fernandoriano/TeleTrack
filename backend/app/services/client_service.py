from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import hash_password


def create_client(
    db: Session,
    client_data: schemas.ClientCreate
) -> models.Client:

    existing_client = (
        db.query(models.Client)
        .filter(
            models.Client.client_code
            == client_data.client_code
        )
        .first()
    )

    if existing_client is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Client code already exists"
        )

    existing_user = (
        db.query(models.User)
        .filter(
            models.User.username
            == client_data.username
        )
        .first()
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )

    client = models.Client(
        client_code=client_data.client_code,
        name=client_data.name,
        company_name=client_data.company_name,
        email=client_data.email,
        phone=client_data.phone,
        active=True
    )

    try:
        db.add(client)

        db.flush()

        client_user = models.User(
            client_id=client.id,
            username=client_data.username,
            password_hash=hash_password(
                client_data.password
            ),
            full_name=client_data.full_name,
            email=client_data.email,
            role="client",
            active=True
        )

        db.add(client_user)

        db.commit()

        db.refresh(client)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Client or username already exists"
            )
        )

    except Exception:
        db.rollback()

        raise

    return client


def get_clients(
    db: Session,
    include_inactive: bool = False
) -> list[models.Client]:

    query = db.query(models.Client)

    if not include_inactive:
        query = query.filter(
            models.Client.active.is_(True)
        )

    return (
        query
        .order_by(models.Client.id.asc())
        .all()
    )


def get_client_by_id(
    db: Session,
    client_id: int
) -> models.Client:

    client = (
        db.query(models.Client)
        .filter(
            models.Client.id == client_id
        )
        .first()
    )

    if client is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    return client


def update_client(
    db: Session,
    client_id: int,
    client_data: schemas.ClientUpdate
) -> models.Client:

    client = get_client_by_id(
        db=db,
        client_id=client_id
    )

    update_data = client_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            client,
            field,
            value
        )

    db.commit()
    db.refresh(client)

    return client


def set_client_status(
    db: Session,
    client_id: int,
    active: bool
) -> models.Client:

    client = get_client_by_id(
        db=db,
        client_id=client_id
    )

    client.active = active

    for user in client.users:
        if user.role == "client":
            user.active = active

    for vehicle in client.vehicles:
        vehicle.active = active

        if vehicle.device is not None:
            vehicle.device.active = active

    db.commit()
    db.refresh(client)

    return client


def get_client_users(
    db: Session,
    client_id: int
) -> list[models.User]:

    get_client_by_id(
        db=db,
        client_id=client_id
    )

    return (
        db.query(models.User)
        .filter(
            models.User.client_id == client_id
        )
        .order_by(models.User.id.asc())
        .all()
    )


def get_client_vehicles(
    db: Session,
    client_id: int
) -> list[models.Vehicle]:

    get_client_by_id(
        db=db,
        client_id=client_id
    )

    return (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.client_id == client_id
        )
        .order_by(models.Vehicle.id.asc())
        .all()
    )

