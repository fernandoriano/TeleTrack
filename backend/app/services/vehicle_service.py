from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.services.security_service import (
    generate_activation_secret,
    hash_activation_secret
)


def generate_vehicle_code(
    db: Session
) -> str:

    vehicles = (
        db.query(models.Vehicle)
        .order_by(models.Vehicle.id.desc())
        .all()
    )

    highest_number = 0

    for vehicle in vehicles:
        code = vehicle.vehicle_code

        if (
            code
            and code.startswith("VH")
            and code[2:].isdigit()
        ):
            number = int(code[2:])

            if number > highest_number:
                highest_number = number

    next_number = highest_number + 1

    return f"VH{next_number:02d}"


def create_vehicle(
    db: Session,
    vehicle_data: schemas.VehicleCreate
) -> tuple[models.Vehicle, str]:

    client = (
        db.query(models.Client)
        .filter(
            models.Client.id
            == vehicle_data.client_id
        )
        .first()
    )

    if client is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    if not client.active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Client is inactive"
        )

    vehicle_code = generate_vehicle_code(db)

    activation_secret = (
        generate_activation_secret()
    )

    vehicle = models.Vehicle(
        client_id=vehicle_data.client_id,
        vehicle_code=vehicle_code,
        plate=vehicle_data.plate,
        description=vehicle_data.description,
        brand=vehicle_data.brand,
        model=vehicle_data.model,
        active=True
    )

    db.add(vehicle)
    db.flush()

    device = models.VehicleDevice(
        vehicle_id=vehicle.id,
        activation_secret_hash=(
            hash_activation_secret(
                activation_secret
            )
        ),
        activated=False,
        active=True
    )

    db.add(device)

    db.commit()
    db.refresh(vehicle)

    return vehicle, activation_secret


def get_vehicle_by_id(
    db: Session,
    vehicle_id: int
) -> models.Vehicle:

    vehicle = (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.id == vehicle_id
        )
        .first()
    )

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )

    return vehicle


def get_vehicle_by_code(
    db: Session,
    vehicle_code: str
) -> models.Vehicle:

    vehicle = (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.vehicle_code
            == vehicle_code
        )
        .first()
    )

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )

    return vehicle


def get_all_vehicles(
    db: Session,
    include_inactive: bool = False
) -> list[models.Vehicle]:

    query = db.query(models.Vehicle)

    if not include_inactive:
        query = query.filter(
            models.Vehicle.active.is_(True)
        )

    return (
        query
        .order_by(models.Vehicle.id.asc())
        .all()
    )


def get_client_vehicles(
    db: Session,
    client_id: int,
    include_inactive: bool = False
) -> list[models.Vehicle]:

    query = (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.client_id
            == client_id
        )
    )

    if not include_inactive:
        query = query.filter(
            models.Vehicle.active.is_(True)
        )

    return (
        query
        .order_by(models.Vehicle.id.asc())
        .all()
    )


def update_vehicle(
    db: Session,
    vehicle_id: int,
    vehicle_data: schemas.VehicleUpdate
) -> models.Vehicle:

    vehicle = get_vehicle_by_id(
        db=db,
        vehicle_id=vehicle_id
    )

    update_data = vehicle_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            vehicle,
            field,
            value
        )

    if (
        vehicle.device is not None
        and vehicle_data.active is not None
    ):
        vehicle.device.active = (
            vehicle_data.active
        )

    db.commit()
    db.refresh(vehicle)

    return vehicle


def regenerate_activation_secret(
    db: Session,
    vehicle_id: int
) -> str:

    vehicle = get_vehicle_by_id(
        db=db,
        vehicle_id=vehicle_id
    )

    if vehicle.device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle device not found"
        )

    activation_secret = (
        generate_activation_secret()
    )

    vehicle.device.activation_secret_hash = (
        hash_activation_secret(
            activation_secret
        )
    )

    vehicle.device.device_token_hash = None
    vehicle.device.device_name = None
    vehicle.device.activated = False
    vehicle.device.activated_at = None
    vehicle.device.last_seen_at = None
    vehicle.device.active = True

    db.commit()

    return activation_secret


def delete_vehicle(
    db: Session,
    vehicle_id: int
) -> None:

    vehicle = get_vehicle_by_id(
        db=db,
        vehicle_id=vehicle_id
    )

    try:
        (
            db.query(models.VehicleStats)
            .filter(
                models.VehicleStats.vehicle_id
                == vehicle_id
            )
            .delete(
                synchronize_session=False
            )
        )

        (
            db.query(models.Location)
            .filter(
                models.Location.vehicle_id
                == vehicle_id
            )
            .delete(
                synchronize_session=False
            )
        )

        (
            db.query(models.VehicleDevice)
            .filter(
                models.VehicleDevice.vehicle_id
                == vehicle_id
            )
            .delete(
                synchronize_session=False
            )
        )

        db.delete(vehicle)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=
                "Vehicle could not be deleted"
        )