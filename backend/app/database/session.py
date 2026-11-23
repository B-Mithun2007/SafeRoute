"""Database configuration and session management for SafeRoute-AI.

Provides SQLAlchemy 2.0 engine, declarative base, and session generator.
Uses SQLite for persistent local development as specified.
"""

import os
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

# Resolve database path inside the backend directory to ensure persistence
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_SQLITE_PATH = BACKEND_DIR / "saferoute.db"

# Allow environment variable override, defaulting to persistent SQLite database
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or DATABASE_URL.startswith("postgresql"):
    # Use SQLite for initial development phase
    DATABASE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"

# Configure SQLAlchemy engine
# check_same_thread=False is needed only for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=os.getenv("DB_ECHO", "False").lower() in ("true", "1"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields an active database session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Creates all database tables if they do not exist yet."""
    # Import models here to register them with Base.metadata before creation
    from app.models.user import User  # noqa: F401
    Base.metadata.create_all(bind=engine)
