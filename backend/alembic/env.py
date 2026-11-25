"""Alembic environment configuration for SafeRoute-AI.

Reads DATABASE_URL from the environment (backend/.env) and imports all
SQLAlchemy models so that Alembic can detect schema changes automatically.

PostGIS geometry columns are supported via GeoAlchemy2's Alembic helpers
(render_item), which prevent Alembic from producing no-op diffs for spatial
columns.
"""

import os
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from dotenv import load_dotenv
from geoalchemy2 import alembic_helpers
from sqlalchemy import engine_from_config, pool

# ---------------------------------------------------------------------------
# Load backend/.env before importing app modules
# ---------------------------------------------------------------------------
# Resolve path relative to this file: alembic/env.py → backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BACKEND_DIR / ".env", override=False)

# ---------------------------------------------------------------------------
# Alembic Config object (alembic.ini)
# ---------------------------------------------------------------------------
config = context.config

# Override sqlalchemy.url from the environment so credentials are never
# stored in alembic.ini which is committed to version control.
database_url = os.getenv("DATABASE_URL", "")
if not database_url:
    raise RuntimeError(
        "DATABASE_URL is not set. Set it in backend/.env before running migrations."
    )
# ConfigParser uses % for interpolation; escape literal % characters so the
# URL (which may contain %-encoded characters like %40 for @) is passed through
# verbatim without triggering a ConfigParser interpolation error.
config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))

# ---------------------------------------------------------------------------
# Python logging
# ---------------------------------------------------------------------------
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------------------------------------
# Import models — required for Alembic to detect table changes
# ---------------------------------------------------------------------------
# Import Base and all models here so their metadata is available.
from app.database.session import Base  # noqa: E402
import app.models.user        # noqa: F401, E402
import app.models.spatial     # noqa: F401, E402

target_metadata = Base.metadata

# ---------------------------------------------------------------------------
# PostGIS internal table exclusion
# ---------------------------------------------------------------------------
# PostGIS manages several internal tables (spatial_ref_sys, geometry_columns,
# geography_columns, raster_columns, raster_overviews). Alembic must not
# detect, create, or drop them. The include_object callback filters them out.
_POSTGIS_INTERNAL_TABLES = {
    "spatial_ref_sys",
    "geometry_columns",
    "geography_columns",
    "raster_columns",
    "raster_overviews",
}


def include_object(obj, name, type_, reflected, compare_to):
    """Exclude PostGIS-managed internal tables from autogenerate comparisons."""
    if type_ == "table" and name in _POSTGIS_INTERNAL_TABLES:
        return False
    return True

# ---------------------------------------------------------------------------
# Offline migration (generates SQL without connecting to the DB)
# ---------------------------------------------------------------------------


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    Emits migration SQL to stdout or a file without requiring a live database
    connection. Useful for reviewing SQL before applying it.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # GeoAlchemy2: render geometry column types correctly
        render_item=alembic_helpers.render_item,
        include_schemas=True,
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migration (connects to PostgreSQL and applies changes)
# ---------------------------------------------------------------------------


def run_migrations_online() -> None:
    """Run migrations in 'online' mode against a live PostgreSQL database."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # GeoAlchemy2: prevent spurious diffs for geometry columns
            render_item=alembic_helpers.render_item,
            include_schemas=True,
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
