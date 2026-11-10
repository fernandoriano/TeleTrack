from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app import models, schemas

from app.dependencies import (
    get_current_user,
    get_db,
    require_engineer,
)

from app.services import vehicle_service


router = APIRouter(
    prefix="/api/v1/vehicles",
    tags=["Vehicles"],
)


@router.post(
    "",
    response_model=schemas.VehicleCreateResponse,
)
def create_vehicle(
    vehicle_data: schemas.VehicleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    ),
):
    vehicle, activation_secret = (
        vehicle_service.create_vehicle(
            db=db,
            vehicle_data=vehicle_data,
        )
    )

    return schemas.VehicleCreateResponse(
        id=vehicle.id,
        client_id=vehicle.client_id,
        vehicle_code=vehicle.vehicle_code,
        plate=vehicle.plate,
        description=vehicle.description,
        brand=vehicle.brand,
        model=vehicle.model,
        active=vehicle.active,
        created_at=vehicle.created_at,
        activation_secret=activation_secret,
    )


@router.get(
    "",
    response_model=list[
        schemas.VehicleResponse
    ],
)
def list_vehicles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    ),
):
    if current_user.role == "engineer":
        return (
            vehicle_service.get_all_vehicles(
                db=db
            )
        )

    if current_user.role == "client":
        if current_user.client_id is None:
            raise HTTPException(
                status_code=
                    status.HTTP_403_FORBIDDEN,
                detail=(
                    "Client account has "
                    "no client assigned"
                ),
            )

        return (
            vehicle_service
            .get_client_vehicles(
                db=db,
                client_id=
                    current_user.client_id,
            )
        )

    raise HTTPException(
        status_code=
            status.HTTP_403_FORBIDDEN,
        detail="Role not allowed",
    )


@router.get(
    "/{vehicle_id}",
    response_model=schemas.VehicleResponse,
)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    ),
):
    vehicle = (
        vehicle_service.get_vehicle_by_id(
            db=db,
            vehicle_id=vehicle_id,
        )
    )

    if current_user.role == "client":
        if (
            vehicle.client_id
            != current_user.client_id
        ):
            raise HTTPException(
                status_code=
                    status.HTTP_403_FORBIDDEN,
                detail=(
                    "You cannot access "
                    "this vehicle"
                ),
            )

    return vehicle


@router.patch(
    "/{vehicle_id}",
    response_model=schemas.VehicleResponse,
)
def update_vehicle(
    vehicle_id: int,
    vehicle_data: schemas.VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    ),
):
    return (
        vehicle_service.update_vehicle(
            db=db,
            vehicle_id=vehicle_id,
            vehicle_data=vehicle_data,
        )
    )


@router.delete(
    "/{vehicle_id}",
    response_model=schemas.MessageResponse,
)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    ),
):
    vehicle = (
        vehicle_service.get_vehicle_by_id(
            db=db,
            vehicle_id=vehicle_id,
        )
    )

    vehicle_code = vehicle.vehicle_code

    vehicle_service.delete_vehicle(
        db=db,
        vehicle_id=vehicle_id,
    )

    return schemas.MessageResponse(
        message=(
            f"Vehicle {vehicle_code} "
            "deleted successfully"
        )
    )


@router.post(
    "/{vehicle_id}/regenerate-activation-secret"
)
def regenerate_activation_secret(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    ),
):
    activation_secret = (
        vehicle_service
        .regenerate_activation_secret(
            db=db,
            vehicle_id=vehicle_id,
        )
    )

    return {
        "vehicle_id": vehicle_id,
        "activation_secret":
            activation_secret,
    }