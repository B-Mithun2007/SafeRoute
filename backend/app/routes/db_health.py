"""Database health and PostGIS verification endpoint."""

from fastapi import APIRouter, status

from app.database.session import check_postgis

router = APIRouter(prefix="/api", tags=["Database"])


@router.get(
    "/db-health",
    summary="PostgreSQL + PostGIS Connectivity Check",
    description=(
        "Verifies that the backend can connect to PostgreSQL and that the "
        "PostGIS extension is available. Returns connection status, current "
        "database name, and PostGIS version. "
        "Database credentials are never included in the response."
    ),
    status_code=status.HTTP_200_OK,
)
def db_health_check() -> dict:
    """
    **Database Health Check** (`GET /api/db-health`)

    ### Response fields
    - **connected**: Whether a live PostgreSQL connection was established.
    - **database**: Name of the connected database (`current_database()`).
    - **postgis_available**: Whether `PostGIS_Full_Version()` returned a value.
    - **postgis_version**: Full PostGIS version string (or null on failure).
    - **error**: Error message if the check failed (null on success).
    """
    return check_postgis()
