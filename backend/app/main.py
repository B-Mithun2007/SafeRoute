"""Main entrypoint for the SafeRoute-AI FastAPI backend application.

This module initializes the FastAPI service, configures CORS middleware
for local frontend communication, and exposes core health check and root endpoints.
"""

from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI application with project metadata
app = FastAPI(
    title="SafeRoute-AI API",
    description=(
        "Intelligent safety-aware navigation and routing backend. "
        "Provides endpoints for evaluating route risk, analyzing incident reports, "
        "and scoring geographical zones for pedestrian and commuter safety."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS Configuration (Cross-Origin Resource Sharing)
# ---------------------------------------------------------------------------
# Enables local frontend clients (React Native / Expo / Web) to communicate
# with the backend without browser or network blocking.
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8081",  # Standard Expo Metro bundler port
    "http://localhost:19000", # Classic Expo CLI port
    "http://localhost:19006", # Expo Web preview port
    "http://127.0.0.1:8081",
    "http://127.0.0.1:3000",
    "*"  # Permissive for local hackathon development across emulators and physical devices
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Core Endpoints
# ---------------------------------------------------------------------------
@app.get(
    "/",
    tags=["Root"],
    summary="API Root Information",
    status_code=status.HTTP_200_OK,
)
def read_root() -> Dict[str, Any]:
    """Returns welcoming project metadata and quick links to documentation."""
    return {
        "project": "SafeRoute-AI",
        "description": "Intelligent safety-aware routing engine API",
        "version": "0.1.0",
        "documentation": "/docs",
        "health_check": "/health",
        "status": "online",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Service Health Check",
    status_code=status.HTTP_200_OK,
)
def health_check() -> Dict[str, Any]:
    """Provides a quick health check endpoint to verify backend operational readiness."""
    return {
        "status": "healthy",
        "service": "saferoute-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": "development",
    }
