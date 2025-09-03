"""
Database connection and session management.

This module handles database connections, session management,
and database initialization for the Argo platform.

For development without Docker: Uses SQLite
For production: Uses PostgreSQL with PostGIS and pgvector

Author: Argo Platform Team
Created: 2025-09-03
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from typing import Generator
import logging

from ..config import get_settings, is_development
from .models import Base

logger = logging.getLogger(__name__)


def get_database_url() -> str:
    """
    Get database URL based on environment.
    
    Returns:
        str: Database connection URL
    """
    settings = get_settings()
    
    if is_development() and not os.path.exists("postgres_available"):
        # Use SQLite for development when PostgreSQL is not available
        db_path = "data/argo_dev.db"
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        return f"sqlite:///{db_path}"
    else:
        # Use PostgreSQL for production or when available
        return settings.database_url


def create_database_engine():
    """
    Create and configure database engine.
    
    Returns:
        Engine: Configured SQLAlchemy engine
    """
    database_url = get_database_url()
    
    if database_url.startswith("sqlite"):
        # SQLite configuration for development
        engine = create_engine(
            database_url,
            poolclass=StaticPool,
            connect_args={
                "check_same_thread": False,
                "timeout": 30
            },
            echo=is_development()
        )
        
        # Enable foreign key constraints for SQLite
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.close()
            
    else:
        # PostgreSQL configuration
        engine = create_engine(
            database_url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            echo=is_development()
        )
    
    logger.info(f"Database engine created for: {database_url}")
    return engine


# Global engine and session factory
engine = create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_database():
    """
    Initialize database schema.
    
    Creates all tables defined in models.py.
    Safe to call multiple times.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully")
        
        # Create some initial data summaries for Indian Ocean
        _create_initial_summaries()
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


def _create_initial_summaries():
    """Create initial data summaries for the Indian Ocean region."""
    from .models import DataSummary
    
    with get_db_session() as db:
        # Check if we already have summaries
        existing = db.query(DataSummary).filter(
            DataSummary.region_name == "Indian Ocean"
        ).first()
        
        if not existing:
            # Create Indian Ocean summary placeholder
            indian_ocean_summary = DataSummary(
                summary_type="region",
                region_name="Indian Ocean",
                min_latitude=-40.0,
                max_latitude=30.0,
                min_longitude=-90.0,
                max_longitude=90.0,
                description="Indian Ocean region with active Argo float coverage. Primary focus area for temperature and salinity monitoring.",
                total_profiles=0,
                total_measurements=0,
                has_bgc_data=False
            )
            
            db.add(indian_ocean_summary)
            db.commit()
            logger.info("Created initial Indian Ocean data summary")


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    
    Yields:
        Session: Database session
        
    Usage in FastAPI:
        @app.get("/")
        def read_root(db: Session = Depends(get_db)):
            return {"message": "Hello World"}
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    
    Yields:
        Session: Database session
        
    Usage:
        with get_db_session() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def check_database_connection() -> bool:
    """
    Check if database connection is working.
    
    Returns:
        bool: True if connection successful
    """
    try:
        from sqlalchemy import text
        with get_db_session() as db:
            # Simple query to test connection
            db.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def reset_database():
    """
    Reset database by dropping and recreating all tables.
    
    WARNING: This will delete all data!
    Only use in development.
    """
    if not is_development():
        raise RuntimeError("Database reset only allowed in development mode")
    
    logger.warning("Resetting database - all data will be lost!")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("Database reset completed")


# Export main functions
__all__ = [
    'engine',
    'SessionLocal',
    'init_database',
    'get_db',
    'get_db_session',
    'check_database_connection',
    'reset_database'
]
