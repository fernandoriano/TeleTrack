from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    clients,
    stats,
    telemetry,
    vehicles
)


app = FastAPI(
    title="TeleTrack API",
    description=(
        "API principal de TeleTrack para autenticación, "
        "gestión de clientes y vehículos, telemetría "
        "vehicular y consulta de estadísticas."
    ),
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth.router
)

app.include_router(
    clients.router
)

app.include_router(
    vehicles.router
)

app.include_router(
    telemetry.router
)

app.include_router(
    stats.router
)


# =========================================================
# GENERAL ENDPOINTS
# =========================================================

@app.get(
    "/",
    tags=["System"]
)
def root():
    return {
        "system": "TeleTrack",
        "status": "running",
        "version": "1.0.0"
    }


@app.get(
    "/health",
    tags=["System"]
)
def health():
    return {
        "system": "TeleTrack API",
        "status": "healthy"
    }
