from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    client_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    company_name = Column(
        String(150)
    )

    email = Column(
        String(150)
    )

    phone = Column(
        String(30)
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    users = relationship(
        "User",
        back_populates="client"
    )

    vehicles = relationship(
        "Vehicle",
        back_populates="client"
    )


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "role IN ('engineer', 'client')",
            name="chk_users_role"
        ),
    )

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    client_id = Column(
        BigInteger,
        ForeignKey(
            "clients.id",
            ondelete="CASCADE"
        ),
        nullable=True,
        index=True
    )

    username = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    full_name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(150)
    )

    role = Column(
        String(20),
        nullable=False
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    client = relationship(
        "Client",
        back_populates="users"
    )

    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user"
    )


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    client_id = Column(
        BigInteger,
        ForeignKey(
            "clients.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    vehicle_code = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )

    plate = Column(
        String(20)
    )

    description = Column(
        String(150)
    )

    brand = Column(
        String(100)
    )

    model = Column(
        String(100)
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    client = relationship(
        "Client",
        back_populates="vehicles"
    )

    device = relationship(
        "VehicleDevice",
        back_populates="vehicle",
        uselist=False
    )

    locations = relationship(
        "Location",
        back_populates="vehicle"
    )

    stats = relationship(
        "VehicleStats",
        back_populates="vehicle",
        uselist=False
    )


class VehicleDevice(Base):
    __tablename__ = "vehicle_devices"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    vehicle_id = Column(
        BigInteger,
        ForeignKey(
            "vehicles.id",
            ondelete="CASCADE"
        ),
        unique=True,
        nullable=False,
        index=True
    )

    activation_secret_hash = Column(
        String(255),
        nullable=False
    )

    device_token_hash = Column(
        String(255)
    )

    device_name = Column(
        String(150)
    )

    activated = Column(
        Boolean,
        nullable=False,
        default=False
    )

    activated_at = Column(
        DateTime(timezone=True)
    )

    last_seen_at = Column(
        DateTime(timezone=True)
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="device"
    )


class Location(Base):
    __tablename__ = "locations"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    vehicle_id = Column(
        BigInteger,
        ForeignKey(
            "vehicles.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    altitude = Column(Float)
    speed = Column(Float)
    accuracy = Column(Float)
    heading = Column(Float)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="locations"
    )


class VehicleStats(Base):
    __tablename__ = "vehicle_stats"

    vehicle_id = Column(
        BigInteger,
        ForeignKey(
            "vehicles.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    total_positions = Column(
        BigInteger,
        nullable=False,
        default=0
    )

    average_speed = Column(Float)
    max_speed = Column(Float)

    min_altitude = Column(Float)
    max_altitude = Column(Float)

    distance_travelled = Column(
        Float,
        nullable=False,
        default=0
    )

    last_update = Column(
        DateTime(timezone=True)
    )

    processed_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="stats"
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    token_hash = Column(
        String(255),
        unique=True,
        nullable=False
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    revoked = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="refresh_tokens"
    )
    