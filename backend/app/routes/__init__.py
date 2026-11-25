"""API route definitions and endpoints for SafeRoute-AI."""

from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.db_health import router as db_health_router

__all__ = ["health_router", "auth_router", "db_health_router"]
