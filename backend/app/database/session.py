"""Database configuration and session management for SafeRoute-AI.

Provides a SQLAlchemy 2.0 engine, declarative base, and session factory
that connect to PostgreSQL + PostGIS using the psycopg 3 driver.

Environment variable required:
    DATABASE_URL — PostgreSQL connection string in the form:
        postgresql+psycopg://user:password@host:port/dbname

Do NOT hard-code credentials. Load them exclusively from backend/.env.
"""

import logging
import os
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Database URL resolution
# ---------------------------------------------------------------------------
# Loaded from the environment (backend/.env → loaded in main.py and security.py
# before this module is imported).
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    # Raise a clear error if the variable is completely absent
    "",
)

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "Copy backend/.env.example to backend/.env and configure a "
        "PostgreSQL connection string:\n"
        "  DATABASE_URL=postgresql+psycopg://postgres:<password>@localhost:5432/saferoute_db"
    )

if not DATABASE_URL.startswith("postgresql"):
    raise RuntimeError(
        f"DATABASE_URL must use a PostgreSQL driver. "
        f"Got: {DATABASE_URL[:30]}... "
        f"Expected format: postgresql+psycopg://user:password@host:port/dbname"
    )

# ---------------------------------------------------------------------------
# SQLAlchemy engine (synchronous, psycopg 3)
# ---------------------------------------------------------------------------
# pool_pre_ping=True revalidates connections before use, handling stale pool
# connections that occur after a PostgreSQL restart without exposing errors.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=os.getenv("DB_ECHO", "False").lower() in ("true", "1"),
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    """Shared declarative base for all ORM models.

    Every model that inherits from this class will be tracked by SQLAlchemy's
    metadata and can be migrated via Alembic.
    """
    pass


# ---------------------------------------------------------------------------
# FastAPI dependency — database session
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that opens a database session and guarantees cleanup.

    Usage:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Table initialisation (dev convenience — Alembic is preferred for migrations)
# ---------------------------------------------------------------------------
def init_db() -> None:
    """Creates all tables that are registered with Base.metadata.

    In development this is a convenient way to bootstrap the schema without
    running migrations. For production, always use Alembic:
        alembic upgrade head

    PostGIS extension must already exist in the database before this runs:
        CREATE EXTENSION IF NOT EXISTS postgis;
    """
    # Import all models so SQLAlchemy registers them before create_all()
    from app.models.user import User          # noqa: F401
    from app.models.spatial import SafetyZone  # noqa: F401

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created / verified.")
    except OperationalError as exc:
        logger.error(
            "Failed to initialise database tables. "
            "Ensure PostgreSQL is running and DATABASE_URL is correct. "
            "Error: %s", exc
        )
        raise


# ---------------------------------------------------------------------------
# PostGIS connectivity check (used by the /api/db-health endpoint)
# ---------------------------------------------------------------------------
def check_postgis() -> dict:
    """Runs a lightweight connectivity and PostGIS version check.

    Returns a dict with keys: connected, database, postgis_available,
    postgis_version, error.

    Does NOT expose the DATABASE_URL or credentials.
    """
    result: dict = {
        "connected": False,
        "database": None,
        "postgis_available": False,
        "postgis_version": None,
        "error": None,
    }
    try:
        with engine.connect() as conn:
            result["connected"] = True
            result["database"] = conn.execute(text("SELECT current_database()")).scalar()
            postgis_ver = conn.execute(
                text("SELECT PostGIS_Full_Version()")
            ).scalar()
            result["postgis_available"] = True
            result["postgis_version"] = postgis_ver
    except OperationalError as exc:
        result["error"] = f"Database connection failed: {exc.args[0]}"
    except Exception as exc:  # e.g. PostGIS not installed
        result["connected"] = True  # engine connected, but PostGIS missing
        result["error"] = f"PostGIS check failed: {exc}"
    return result
