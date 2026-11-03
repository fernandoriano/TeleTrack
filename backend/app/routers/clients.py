from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies import (
    get_db,
    require_engineer
)
from app.services import client_service


router = APIRouter(
    prefix="/api/v1/clients",
    tags=["Clients"]
)


@router.post(
    "",
    response_model=schemas.ClientResponse
)
def create_client(
    client_data: schemas.ClientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.create_client(
        db=db,
        client_data=client_data
    )


@router.get(
    "",
    response_model=list[schemas.ClientResponse]
)
def list_clients(
    include_inactive: bool = Query(
        default=False
    ),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.get_clients(
        db=db,
        include_inactive=include_inactive
    )


@router.get(
    "/{client_id}",
    response_model=schemas.ClientResponse
)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.get_client_by_id(
        db=db,
        client_id=client_id
    )


@router.patch(
    "/{client_id}",
    response_model=schemas.ClientResponse
)
def update_client(
    client_id: int,
    client_data: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.update_client(
        db=db,
        client_id=client_id,
        client_data=client_data
    )


@router.patch(
    "/{client_id}/activate",
    response_model=schemas.ClientResponse
)
def activate_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.set_client_status(
        db=db,
        client_id=client_id,
        active=True
    )


@router.patch(
    "/{client_id}/deactivate",
    response_model=schemas.ClientResponse
)
def deactivate_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.set_client_status(
        db=db,
        client_id=client_id,
        active=False
    )


@router.get(
    "/{client_id}/users",
    response_model=list[schemas.UserResponse]
)
def get_client_users(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.get_client_users(
        db=db,
        client_id=client_id
    )


@router.get(
    "/{client_id}/vehicles",
    response_model=list[schemas.VehicleResponse]
)
def get_client_vehicles(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_engineer
    )
):

    return client_service.get_client_vehicles(
        db=db,
        client_id=client_id
    )
