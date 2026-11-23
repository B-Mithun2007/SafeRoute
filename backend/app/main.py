"""
Main entry point for the SafeRoute-AI FastAPI backend application.

This module:
  - Loads environment variables from backend/.env on startup.
  - Creates and configures the FastAPI application instance.
  - Sets up CORS middleware for local frontend/mobile development.
  - Initializes database tables (SQLite in local dev).
  - Registers all API route modules (routers).
  - Exposes the root (/) and delegates /api/* routes to dedicated routers.

Run the server from the backend/ directory:
    uvicorn app.main:app --reload
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict

from dotenv import load_dotenv

# Ensure backend/.env is automatically loaded before configuring app services
# override=False preserves any variables already set in the operating system environment
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

# Import database initialization
from app.database import init_db

# Import route modules
from app.routes import health_router, auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown events."""
    # Initialize database tables on startup
    init_db()
    yield


# ---------------------------------------------------------------------------
# FastAPI Application Instance
# ---------------------------------------------------------------------------
# All application-level metadata appears in /docs and /redoc automatically.
app = FastAPI(
    title="SafeRoute AI Backend",
    description=(
        "## SafeRoute AI — Safety-Aware Navigation API\n\n"
        "SafeRoute AI is an intelligent navigation backend that recommends "
        "personalized travel routes by combining **road safety data**, "
        "**time-of-day factors**, **community incident reports**, and "
        "**ML-based risk scoring**.\n\n"
        "### Core Capabilities\n"
        "- 🔐 **Authentication** — User registration and login with secure JWTs.\n"
        "- 🛡️ **Route Safety Evaluation** — Compare and score candidate routes.\n"
        "- 📍 **Zone Safety Scoring** — Query safety score for any coordinate.\n"
        "- 📢 **Incident Reporting** — Accept and serve community hazard reports.\n"
        "- 🤖 **ML Risk Inference** — Predict danger levels via trained models.\n"
    ),
    version="0.1.0",
    docs_url="/docs",    # Swagger UI
    redoc_url="/redoc",  # ReDoc alternative UI
    contact={
        "name": "SafeRoute-AI Team",
    },
    license_info={
        "name": "MIT",
    },
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — Allowed Origins
# ---------------------------------------------------------------------------
# Explicit localhost origins for Expo Web, Metro bundler, and iOS simulator.
# Physical device support: add your PC's LAN IP to CORS_EXTRA_ORIGINS in .env
# Example:  CORS_EXTRA_ORIGINS=http://192.168.1.100:8000
#
# IMPORTANT: Do NOT mix allow_origins=["*"] with allow_credentials=True.
# The CORS spec forbids it; browsers will refuse credentialed cross-origin
# requests when the server returns Access-Control-Allow-Origin: *.
# ---------------------------------------------------------------------------
_base_origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:8081",    # Expo Metro bundler
    "http://localhost:8083",    # Expo Metro alternate
    "http://localhost:19000",   # Expo CLI classic
    "http://localhost:19006",   # Expo Web preview
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:19006",
]

# Read optional extra origins from environment (physical device LAN IPs, etc.)
_extra = os.getenv("CORS_EXTRA_ORIGINS", "")
_extra_origins = [o.strip() for o in _extra.split(",") if o.strip()]

origins = _base_origins + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,       # Needed for Authorization: Bearer <token>
    allow_methods=["*"],          # GET, POST, PUT, DELETE, OPTIONS, PATCH
    allow_headers=["*"],          # Authorization, Content-Type, Accept, etc.
)

# ---------------------------------------------------------------------------
# Register Route Modules (Routers)
# ---------------------------------------------------------------------------
# Health checks: GET /api/health
app.include_router(health_router)

# Authentication: POST /api/auth/register, POST /api/auth/login
app.include_router(auth_router)


# ---------------------------------------------------------------------------
# Root Endpoint  –  GET /
# ---------------------------------------------------------------------------
@app.get(
    "/",
    tags=["Root"],
    summary="API Root — Welcome & Quick Links",
    description=(
        "Returns a welcome message confirming the API is running. "
        "Also provides quick navigation links to the health check and "
        "interactive documentation."
    ),
    status_code=status.HTTP_200_OK,
    response_description="Welcome message and service status",
)
def read_root() -> Dict[str, Any]:
    """
    **API Root** (`GET /`)

    The simplest possible liveness signal.  If you receive a 200 response
    here, the FastAPI process is running correctly.

    ### Response Fields
    - **message**: Greeting string confirming the service identity.
    - **status**: Always `"running"` when the application is live.
    - **version**: Semantic version of the current API release.
    - **docs**: Link to interactive Swagger UI documentation.
    - **health**: Link to the detailed health check endpoint.
    """
    return {
        "message": "Welcome to SafeRoute AI Backend",
        "status": "running",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/health",
    }
