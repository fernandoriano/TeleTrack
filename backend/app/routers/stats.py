from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import (
    get_current_user,
    get_db
)
from app.services.vehicle_service import (
    get_vehicle_by_id
)


router = APIRouter(
    prefix="/api/v1/stats",
    tags=["Statistics"]
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


@router.get(
    "/vehicles/{vehicle_id}",
    response_model=schemas.VehicleStatsDetailedResponse
)
def get_vehicle_stats(
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

    stats_record = (
        db.query(models.VehicleStats)
        .filter(
            models.VehicleStats.vehicle_id
            == vehicle.id
        )
        .first()
    )

    if stats_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Statistics are not available "
                "for this vehicle yet"
            )
        )

    return schemas.VehicleStatsDetailedResponse(
        vehicle_id=stats_record.vehicle_id,
        vehicle_code=vehicle.vehicle_code,
        total_positions=stats_record.total_positions,
        average_speed=stats_record.average_speed,
        max_speed=stats_record.max_speed,
        min_altitude=stats_record.min_altitude,
        max_altitude=stats_record.max_altitude,
        distance_travelled=(
            stats_record.distance_travelled
        ),
        last_update=stats_record.last_update,
        processed_at=stats_record.processed_at
    )


@router.get(
    "",
    response_model=list[
        schemas.VehicleStatsDetailedResponse
    ]
)
def list_accessible_vehicle_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    )
):

    query = (
        db.query(
            models.VehicleStats,
            models.Vehicle
        )
        .join(
            models.Vehicle,
            models.Vehicle.id
            == models.VehicleStats.vehicle_id
        )
    )

    if current_user.role == "client":

        if current_user.client_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Client account has no "
                    "client assigned"
                )
            )

        query = query.filter(
            models.Vehicle.client_id
            == current_user.client_id
        )

    elif current_user.role != "engineer":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role not allowed"
        )

    records = (
        query
        .order_by(models.Vehicle.id.asc())
        .all()
    )

    return [
        schemas.VehicleStatsDetailedResponse(
            vehicle_id=stats_record.vehicle_id,
            vehicle_code=vehicle.vehicle_code,
            total_positions=(
                stats_record.total_positions
            ),
            average_speed=(
                stats_record.average_speed
            ),
            max_speed=stats_record.max_speed,
            min_altitude=(
                stats_record.min_altitude
            ),
            max_altitude=(
                stats_record.max_altitude
            ),
            distance_travelled=(
                stats_record.distance_travelled
            ),
            last_update=stats_record.last_update,
            processed_at=stats_record.processed_at
        )
        for stats_record, vehicle in records
    ]
