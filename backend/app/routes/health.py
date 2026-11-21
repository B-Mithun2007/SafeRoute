"""
Health check routes for SafeRoute-AI.

This module defines the /api/health endpoint using FastAPI's APIRouter,
keeping route definitions modular and separate from the main application entry point.
"""

from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, status

# ---------------------------------------------------------------------------
# Router Setup
# ---------------------------------------------------------------------------
# APIRouter lets us define routes in separate files and register them in
# main.py using app.include_router(). This keeps the codebase modular.
router = APIRouter(
    prefix="/api",          # All routes in this file are prefixed with /api
    tags=["Health"],        # Groups these routes under "Health" in Swagger UI
)


# ---------------------------------------------------------------------------
# GET /api/health
# ---------------------------------------------------------------------------
@router.get(
    "/health",
    summary="API Health Check",
    description=(
        "Returns the operational health status of the SafeRoute AI Backend service. "
        "Use this endpoint to verify the server is running and reachable before "
        "making data requests. Suitable for load-balancer health probes and "
        "monitoring dashboards."
    ),
    status_code=status.HTTP_200_OK,
    response_description="Service health details",
)
def api_health_check() -> Dict[str, Any]:
    """
    **Health Check Endpoint** (`GET /api/health`)

    Returns a JSON payload confirming the backend is healthy.

    ### Response Fields
    - **status**: Always `"healthy"` when the service is up.
    - **service**: Human-readable service name.
    - **timestamp**: Current UTC time in ISO-8601 format.
    - **version**: Current API version string.
    """
    return {
        "status": "healthy",
        "service": "SafeRoute AI Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.1.0",
    }
