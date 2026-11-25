"""Spatial ORM models for SafeRoute-AI.

These models rely on PostGIS geometry types via GeoAlchemy2.

Before running migrations, ensure the PostGIS extension exists:
    CREATE EXTENSION IF NOT EXISTS postgis;

Coordinate reference system: SRID 4326 (WGS 84 — standard GPS coordinates).

DISCLAIMER: Safety zone geometries and incident locations stored here are
community-reported data only. They do NOT guarantee real-world safety and
must NOT be presented to users as authoritative safety certifications.
"""

from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class SafetyZone(Base):
    """A named geographic polygon that represents a community-reported safety zone.

    Geometry column uses PostGIS POLYGON type with SRID 4326.
    """

    __tablename__ = "safety_zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
        comment="Human-readable name of the zone (neighbourhood, district, etc.)",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Optional description of the zone's characteristics",
    )

    # PostGIS POLYGON geometry in WGS 84
    # geometry_type="POLYGON" is enforced at the DB level by PostGIS.
    boundary = mapped_column(
        Geometry(geometry_type="POLYGON", srid=4326),
        nullable=True,
        comment="Zone boundary polygon (WGS 84 / SRID 4326)",
    )

    # Normalised safety score in [0.0, 1.0]; 1.0 = highest reported safety.
    # This is community-reported data, NOT a guarantee of real-world safety.
    safety_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        comment="Community-reported safety score [0.0, 1.0]. Not a safety guarantee.",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class IncidentReport(Base):
    """A community-submitted incident report at a geographic point.

    Geometry column uses PostGIS POINT type with SRID 4326.
    """

    __tablename__ = "incident_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # PostGIS POINT geometry in WGS 84
    location = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=False,
        comment="Incident location as a geographic point (WGS 84 / SRID 4326)",
    )

    incident_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Category of incident (e.g. theft, accident, flooding)",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Optional free-text description supplied by the reporter",
    )
    severity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Reported severity level: 1 (low) to 5 (high). Community-reported only.",
    )

    # Soft-delete / moderation flag
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether a moderator has reviewed this report",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
