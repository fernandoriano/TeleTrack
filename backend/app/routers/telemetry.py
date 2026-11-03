from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    Query,
    status
)
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import (
    get_current_user,
    get_db
)
from app.services import telemetry_service
from app.services.security_service import (
    generate_device_token,
    hash_device_token,
    verify_activation_secret,
    verify_device_token
)
from app.services.vehicle_service import (
    get_vehicle_by_code,
    get_vehicle_by_id
)


router = APIRouter(
    prefix="/api/v1/telemetry",
    tags=["Telemetry"]
)


def get_vehicle_from_device_token(
    db: Session,
    device_token: str
) -> models.Vehicle:

    devices = (
        db.query(models.VehicleDevice)
        .filter(
            models.VehicleDevice.active.is_(True),
            models.VehicleDevice.activated.is_(True),
            models.VehicleDevice.device_token_hash.is_not(None)
        )
        .all()
    )

    for device in devices:
        if verify_device_token(
            token=device_token,
            stored_hash=device.device_token_hash
        ):
            vehicle = device.vehicle

            if vehicle is None:
                break

            if not vehicle.active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Vehicle is inactive"
                )

            if not vehicle.client.active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Client is inactive"
                )

            return vehicle

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid device token"
    )


def validate_vehicle_access(
    vehicle: models.Vehicle,
    current_user: models.User
) -> None:

    if current_user.role == "engineer":
        return

    if current_user.role == "client":
        if current_user.client_id != vehicle.client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot access this vehicle"
            )

        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Role not allowed"
    )


@router.post(
    "/activate",
    response_model=schemas.VehicleActivationResponse
)
def activate_vehicle_device(
    activation_data: schemas.VehicleActivationRequest,
    db: Session = Depends(get_db)
):

    vehicle = get_vehicle_by_code(
        db=db,
        vehicle_code=activation_data.vehicle_code
    )

    if not vehicle.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vehicle is inactive"
        )

    if not vehicle.client.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client is inactive"
        )

    device = vehicle.device

    if device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle device not found"
        )

    if not device.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vehicle device is inactive"
        )

    if not verify_activation_secret(
        activation_secret=activation_data.activation_secret,
        stored_hash=device.activation_secret_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid activation credentials"
        )

    device_token = generate_device_token()

    device.device_token_hash = hash_device_token(
        device_token
    )

    device.device_name = activation_data.device_name
    device.activated = True
    device.activated_at = datetime.now(
        timezone.utc
    )
    device.last_seen_at = datetime.now(
        timezone.utc
    )

    db.commit()
    db.refresh(device)

    return schemas.VehicleActivationResponse(
        vehicle_code=vehicle.vehicle_code,
        device_token=device_token,
        activated=device.activated,
        activated_at=device.activated_at
    )


@router.post(
    "/locations",
    response_model=schemas.LocationResponse
)
def receive_location(
    location_data: schemas.LocationCreate,
    x_device_token: str = Header(
        ...,
        alias="X-Device-Token"
    ),
    db: Session = Depends(get_db)
):

    vehicle = get_vehicle_from_device_token(
        db=db,
        device_token=x_device_token
    )

    return telemetry_service.create_location(
        db=db,
        vehicle=vehicle,
        location_data=location_data
    )


@router.get(
    "/vehicles/{vehicle_id}/latest",
    response_model=schemas.VehicleLocationResponse
)
def latest_vehicle_location(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    )
):

    vehicle = get_vehicle_by_id(
        db=db,
        vehicle_id=vehicle_id
    )

    validate_vehicle_access(
        vehicle=vehicle,
        current_user=current_user
    )

    location = telemetry_service.get_latest_location(
        db=db,
        vehicle_id=vehicle.id
    )

    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No locations found for this vehicle"
        )

    return schemas.VehicleLocationResponse(
        id=location.id,
        vehicle_code=vehicle.vehicle_code,
        timestamp=location.timestamp,
        latitude=location.latitude,
        longitude=location.longitude,
        altitude=location.altitude,
        speed=location.speed,
        accuracy=location.accuracy,
        heading=location.heading,
        created_at=location.created_at
    )


@router.get(
    "/vehicles/{vehicle_id}/history",
    response_model=schemas.RouteHistoryResponse
)
def vehicle_history(
    vehicle_id: int,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    )
):

    vehicle = get_vehicle_by_id(
        db=db,
        vehicle_id=vehicle_id
    )

    validate_vehicle_access(
        vehicle=vehicle,
        current_user=current_user
    )

    locations = telemetry_service.get_vehicle_history(
        db=db,
        vehicle_id=vehicle.id,
        start_date=start_date,
        end_date=end_date
    )

    location_responses = [
        schemas.VehicleLocationResponse(
            id=location.id,
            vehicle_code=vehicle.vehicle_code,
            timestamp=location.timestamp,
            latitude=location.latitude,
            longitude=location.longitude,
            altitude=location.altitude,
            speed=location.speed,
            accuracy=location.accuracy,
            heading=location.heading,
            created_at=location.created_at
        )
        for location in locations
    ]

    return schemas.RouteHistoryResponse(
        vehicle_code=vehicle.vehicle_code,
        start_date=start_date,
        end_date=end_date,
        total_positions=len(location_responses),
        locations=location_responses
    )
