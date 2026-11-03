import os
import time
from datetime import datetime, timezone

from geopy.distance import geodesic
from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Float,
    ForeignKey,
    MetaData,
    String,
    Table,
    create_engine,
    delete,
    func,
    insert,
    select,
    update
)


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://teletrack:teletrack123@database:5432/teletrack"
)

PROCESS_INTERVAL_SECONDS = int(
    os.getenv(
        "PROCESS_INTERVAL_SECONDS",
        "15"
    )
)


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

metadata = MetaData()


# =========================================================
# DATABASE TABLES USED BY THE PROCESSOR
# =========================================================

vehicles = Table(
    "vehicles",
    metadata,
    Column("id", BigInteger, primary_key=True),
    Column("client_id", BigInteger),
    Column("vehicle_code", String),
    Column("active", String)
)


locations = Table(
    "locations",
    metadata,
    Column("id", BigInteger, primary_key=True),
    Column(
        "vehicle_id",
        BigInteger,
        ForeignKey("vehicles.id")
    ),
    Column(
        "timestamp",
        DateTime(timezone=True)
    ),
    Column("latitude", Float),
    Column("longitude", Float),
    Column("altitude", Float),
    Column("speed", Float),
    Column("accuracy", Float),
    Column("heading", Float)
)


vehicle_stats = Table(
    "vehicle_stats",
    metadata,
    Column(
        "vehicle_id",
        BigInteger,
        primary_key=True
    ),
    Column(
        "total_positions",
        BigInteger
    ),
    Column("average_speed", Float),
    Column("max_speed", Float),
    Column("min_altitude", Float),
    Column("max_altitude", Float),
    Column("distance_travelled", Float),
    Column(
        "last_update",
        DateTime(timezone=True)
    ),
    Column(
        "processed_at",
        DateTime(timezone=True)
    )
)


# =========================================================
# DISTANCE CALCULATION
# =========================================================

def calculate_distance(
    position_rows
) -> float:

    if len(position_rows) < 2:
        return 0.0

    total_distance_km = 0.0

    for index in range(
        1,
        len(position_rows)
    ):
        previous = position_rows[
            index - 1
        ]

        current = position_rows[
            index
        ]

        previous_point = (
            previous.latitude,
            previous.longitude
        )

        current_point = (
            current.latitude,
            current.longitude
        )

        total_distance_km += geodesic(
            previous_point,
            current_point
        ).kilometers

    return total_distance_km


# =========================================================
# VEHICLE PROCESSING
# =========================================================

def process_vehicle(
    connection,
    vehicle_id: int,
    vehicle_code: str
) -> None:

    position_rows = (
        connection.execute(
            select(
                locations.c.id,
                locations.c.timestamp,
                locations.c.latitude,
                locations.c.longitude,
                locations.c.altitude,
                locations.c.speed
            )
            .where(
                locations.c.vehicle_id
                == vehicle_id
            )
            .order_by(
                locations.c.timestamp.asc()
            )
        )
        .fetchall()
    )

    if not position_rows:
        print(
            f"[{vehicle_code}] "
            "No positions available."
        )
        return

    total_positions = len(
        position_rows
    )

    speeds = [
        position.speed
        for position in position_rows
        if position.speed is not None
    ]

    altitudes = [
        position.altitude
        for position in position_rows
        if position.altitude is not None
    ]

    average_speed = (
        sum(speeds) / len(speeds)
        if speeds
        else None
    )

    max_speed = (
        max(speeds)
        if speeds
        else None
    )

    min_altitude = (
        min(altitudes)
        if altitudes
        else None
    )

    max_altitude = (
        max(altitudes)
        if altitudes
        else None
    )

    distance_travelled = (
        calculate_distance(
            position_rows
        )
    )

    last_update = (
        position_rows[-1].timestamp
    )

    processed_at = (
        datetime.now(timezone.utc)
    )

    existing_stats = (
        connection.execute(
            select(
                vehicle_stats.c.vehicle_id
            )
            .where(
                vehicle_stats.c.vehicle_id
                == vehicle_id
            )
        )
        .first()
    )

    stats_values = {
        "vehicle_id": vehicle_id,
        "total_positions": (
            total_positions
        ),
        "average_speed": (
            average_speed
        ),
        "max_speed": (
            max_speed
        ),
        "min_altitude": (
            min_altitude
        ),
        "max_altitude": (
            max_altitude
        ),
        "distance_travelled": (
            distance_travelled
        ),
        "last_update": (
            last_update
        ),
        "processed_at": (
            processed_at
        )
    }

    if existing_stats is None:

        connection.execute(
            insert(
                vehicle_stats
            )
            .values(
                **stats_values
            )
        )

    else:

        connection.execute(
            update(
                vehicle_stats
            )
            .where(
                vehicle_stats.c.vehicle_id
                == vehicle_id
            )
            .values(
                total_positions=(
                    total_positions
                ),
                average_speed=(
                    average_speed
                ),
                max_speed=(
                    max_speed
                ),
                min_altitude=(
                    min_altitude
                ),
                max_altitude=(
                    max_altitude
                ),
                distance_travelled=(
                    distance_travelled
                ),
                last_update=(
                    last_update
                ),
                processed_at=(
                    processed_at
                )
            )
        )

    print(
        f"[{vehicle_code}] "
        f"positions={total_positions}, "
        f"avg_speed={average_speed}, "
        f"max_speed={max_speed}, "
        f"distance_km="
        f"{distance_travelled:.6f}"
    )


# =========================================================
# PROCESSING CYCLE
# =========================================================

def process_all_vehicles() -> None:

    with engine.begin() as connection:

        vehicle_rows = (
            connection.execute(
                select(
                    vehicles.c.id,
                    vehicles.c.vehicle_code
                )
                .order_by(
                    vehicles.c.id.asc()
                )
            )
            .fetchall()
        )

        if not vehicle_rows:
            print(
                "No vehicles found."
            )
            return

        for vehicle in vehicle_rows:

            process_vehicle(
                connection=connection,
                vehicle_id=vehicle.id,
                vehicle_code=(
                    vehicle.vehicle_code
                )
            )


# =========================================================
# MAIN LOOP
# =========================================================

def main() -> None:

    print(
        "======================================"
    )
    print(
        " TeleTrack Processor"
    )
    print(
        "======================================"
    )
    print(
        f"Processing interval: "
        f"{PROCESS_INTERVAL_SECONDS} seconds"
    )
    print()

    while True:

        try:

            print(
                "Starting statistics cycle..."
            )

            process_all_vehicles()

            print(
                "Statistics cycle completed."
            )

        except Exception as error:

            print(
                "Processor error:"
            )
            print(
                str(error)
            )

        print(
            f"Next cycle in "
            f"{PROCESS_INTERVAL_SECONDS} seconds."
        )
        print()

        time.sleep(
            PROCESS_INTERVAL_SECONDS
        )


if __name__ == "__main__":
    main()
    