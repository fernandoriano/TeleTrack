from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field
)


# =========================================================
# AUTHENTICATION
# =========================================================

class LoginRequest(BaseModel):
    username: str = Field(
        min_length=4,
        max_length=100
    )

    password: str = Field(
        min_length=8,
        max_length=128
    )


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# =========================================================
# USERS
# =========================================================

class UserBase(BaseModel):
    username: str = Field(
        min_length=4,
        max_length=100
    )

    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr | None = None


class UserCreate(UserBase):
    password: str = Field(
        min_length=8,
        max_length=128
    )

    role: str = Field(
        pattern="^(engineer|client)$"
    )

    client_id: int | None = None


class UserResponse(UserBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    client_id: int | None
    role: str
    active: bool
    created_at: datetime


# =========================================================
# CLIENTS
# =========================================================

class ClientBase(BaseModel):
    client_code: str = Field(
        min_length=2,
        max_length=20
    )

    name: str = Field(
        min_length=2,
        max_length=150
    )

    company_name: str | None = Field(
        default=None,
        max_length=150
    )

    email: EmailStr | None = None

    phone: str | None = Field(
        default=None,
        max_length=30
    )


class ClientCreate(BaseModel):
    client_code: str = Field(
        min_length=2,
        max_length=20
    )

    name: str = Field(
        min_length=2,
        max_length=150
    )

    company_name: str | None = Field(
        default=None,
        max_length=150
    )

    email: EmailStr | None = None

    phone: str | None = Field(
        default=None,
        max_length=30
    )

    username: str = Field(
        min_length=4,
        max_length=100
    )

    password: str = Field(
        min_length=8,
        max_length=128
    )

    full_name: str = Field(
        min_length=2,
        max_length=150
    )


class ClientUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    company_name: str | None = Field(
        default=None,
        max_length=150
    )

    email: EmailStr | None = None

    phone: str | None = Field(
        default=None,
        max_length=30
    )

    active: bool | None = None


class ClientResponse(ClientBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    active: bool
    created_at: datetime


# =========================================================
# VEHICLES
# =========================================================

class VehicleBase(BaseModel):
    plate: str | None = Field(
        default=None,
        max_length=20
    )

    description: str | None = Field(
        default=None,
        max_length=150
    )

    brand: str | None = Field(
        default=None,
        max_length=100
    )

    model: str | None = Field(
        default=None,
        max_length=100
    )


class VehicleCreate(VehicleBase):
    client_id: int


class VehicleUpdate(BaseModel):
    plate: str | None = Field(
        default=None,
        max_length=20
    )

    description: str | None = Field(
        default=None,
        max_length=150
    )

    brand: str | None = Field(
        default=None,
        max_length=100
    )

    model: str | None = Field(
        default=None,
        max_length=100
    )

    active: bool | None = None


class VehicleResponse(VehicleBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    client_id: int
    vehicle_code: str
    active: bool
    created_at: datetime


class VehicleCreateResponse(VehicleResponse):
    activation_secret: str


# =========================================================
# VEHICLE DEVICE ACTIVATION
# =========================================================

class VehicleActivationRequest(BaseModel):
    vehicle_code: str = Field(
        min_length=4,
        max_length=20
    )

    activation_secret: str = Field(
        min_length=8,
        max_length=8,
        pattern=r"^[A-Za-z0-9]{8}$"
    )

    device_name: str | None = Field(
        default=None,
        max_length=150
    )


class VehicleActivationResponse(BaseModel):
    vehicle_code: str
    device_token: str
    activated: bool
    activated_at: datetime


# =========================================================
# TELEMETRY / LOCATIONS
# =========================================================

class LocationCreate(BaseModel):
    timestamp: datetime

    latitude: float = Field(
        ge=-90,
        le=90
    )

    longitude: float = Field(
        ge=-180,
        le=180
    )

    altitude: float | None = None

    speed: float | None = Field(
        default=None,
        ge=0
    )

    accuracy: float | None = Field(
        default=None,
        ge=0
    )

    heading: float | None = Field(
        default=None,
        ge=0,
        lt=360
    )


class LocationResponse(LocationCreate):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    vehicle_id: int
    created_at: datetime


class VehicleLocationResponse(BaseModel):
    id: int
    vehicle_code: str

    timestamp: datetime

    latitude: float
    longitude: float

    altitude: float | None
    speed: float | None
    accuracy: float | None
    heading: float | None

    created_at: datetime


# =========================================================
# VEHICLE STATS
# =========================================================

class VehicleStatsResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    vehicle_id: int
    total_positions: int

    average_speed: float | None
    max_speed: float | None

    min_altitude: float | None
    max_altitude: float | None

    distance_travelled: float

    last_update: datetime | None
    processed_at: datetime | None


class VehicleStatsDetailedResponse(
    VehicleStatsResponse
):
    vehicle_code: str


# =========================================================
# ROUTE HISTORY
# =========================================================

class RouteHistoryRequest(BaseModel):
    start_date: datetime
    end_date: datetime


class RouteHistoryResponse(BaseModel):
    vehicle_code: str
    start_date: datetime
    end_date: datetime
    total_positions: int

    locations: list[
        VehicleLocationResponse
    ]


# =========================================================
# GENERAL API RESPONSES
# =========================================================

class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    system: str
    status: str
    