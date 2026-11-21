"""API route definitions and endpoints for SafeRoute-AI.

Each sub-module (health.py, routes.py, reports.py, etc.) defines an
APIRouter that is imported here and registered in app/main.py via
app.include_router().  Centralising imports here keeps main.py clean.
"""

# Re-export routers so main.py can do:  from app.routes import health_router
from app.routes.health import router as health_router

__all__ = ["health_router"]
