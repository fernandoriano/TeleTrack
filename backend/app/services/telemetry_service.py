from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas


def create_location(
    db: Session,
    vehicle: models.Vehicle,
    location_data: schemas.LocationCreate
) -> models.Location:

    if not vehicle.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vehicle is inactive"
        )

    if vehicle.device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle device not found"
        )

    if not vehicle.device.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vehicle device is inactive"
        )

    if not vehicle.device.activated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vehicle device is not activated"
        )

    location = models.Location(
        vehicle_id=vehicle.id,
        timestamp=location_data.timestamp,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
        altitude=location_data.altitude,
        speed=location_data.speed,
        accuracy=location_data.accuracy,
        heading=location_data.heading
    )

    vehicle.device.last_seen_at = (
        datetime.now(timezone.utc)
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    return location


def get_latest_location(
    db: Session,
    vehicle_id: int
) -> models.Location | None:

    return (
        db.query(models.Location)
        .filter(
            models.Location.vehicle_id
            == vehicle_id
        )
        .order_by(
            models.Location.timestamp.desc()
        )
        .first()
    )


def get_vehicle_history(
    db: Session,
    vehicle_id: int,
    start_date: datetime,
    end_date: datetime
) -> list[models.Location]:

    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "start_date must be earlier "
                "than end_date"
            )
        )

    return (
        db.query(models.Location)
        .filter(
            models.Location.vehicle_id
            == vehicle_id,
            models.Location.timestamp >= start_date,
            models.Location.timestamp <= end_date
        )
        .order_by(
            models.Location.timestamp.asc()
        )
        .all()
    )


def get_all_vehicle_locations(
    db: Session,
    vehicle_id: int
) -> list[models.Location]:

    return (
        db.query(models.Location)
        .filter(
            models.Location.vehicle_id
            == vehicle_id
        )
        .order_by(
            models.Location.timestamp.asc()
        )
        .all()
    )
