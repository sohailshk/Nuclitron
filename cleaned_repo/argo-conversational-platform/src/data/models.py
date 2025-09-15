"""
Database models for Argo Conversational Platform.

This module defines SQLAlchemy models for storing Argo ocean data,
metadata, and vector embeddings. Designed for PostgreSQL with PostGIS
but compatible with SQLite for development.

Author: Argo Platform Team
Created: 2025-09-03
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean,
    ForeignKey, Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()


class ArgoFloat(Base):
    """
    Argo float metadata and deployment information.
    
    Stores information about individual Argo floats including
    deployment location, operational status, and technical specifications.
    """
    __tablename__ = "argo_floats"
    
    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    float_id = Column(Integer, unique=True, nullable=False, index=True)
    wmo_id = Column(String(20), unique=True, nullable=False, index=True)
    
    # Deployment information
    deployment_date = Column(DateTime, nullable=True)
    deployment_latitude = Column(Float, nullable=True)
    deployment_longitude = Column(Float, nullable=True)
    
    # Float specifications
    float_type = Column(String(50), nullable=True)
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    
    # Operational status
    status = Column(String(20), default='active')  # active, inactive, unknown
    last_position_date = Column(DateTime, nullable=True)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    
    # Data availability flags
    has_core_data = Column(Boolean, default=True)
    has_bgc_data = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    profiles = relationship("ArgoProfile", back_populates="float", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('deployment_latitude >= -90 AND deployment_latitude <= 90', 
                       name='valid_deployment_lat'),
        CheckConstraint('deployment_longitude >= -180 AND deployment_longitude <= 180', 
                       name='valid_deployment_lon'),
        CheckConstraint('last_latitude >= -90 AND last_latitude <= 90', 
                       name='valid_last_lat'),
        CheckConstraint('last_longitude >= -180 AND last_longitude <= 180', 
                       name='valid_last_lon'),
        Index('idx_float_location', 'last_latitude', 'last_longitude'),
        Index('idx_float_deployment', 'deployment_latitude', 'deployment_longitude'),
    )


class ArgoProfile(Base):
    """
    Individual Argo profiles (vertical measurements).
    
    Each profile represents a single vertical measurement cycle
    from an Argo float, containing temperature, salinity, and pressure data.
    """
    __tablename__ = "argo_profiles"
    
    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    float_id = Column(Integer, ForeignKey('argo_floats.float_id'), nullable=False, index=True)
    cycle_number = Column(Integer, nullable=False)
    
    # Profile metadata
    profile_date = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Data quality and processing
    data_mode = Column(String(1), nullable=False)  # R=real-time, A=adjusted, D=delayed
    qc_flag = Column(String(1), nullable=False, default='1')  # 1=good, 2=probably good, etc.
    
    # Profile characteristics
    profile_direction = Column(String(1), nullable=True)  # A=ascending, D=descending
    max_pressure = Column(Float, nullable=True)
    min_pressure = Column(Float, nullable=True)
    num_levels = Column(Integer, nullable=True)
    
    # Data availability
    has_temperature = Column(Boolean, default=True)
    has_salinity = Column(Boolean, default=True)
    has_pressure = Column(Boolean, default=True)
    has_bgc_data = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    float = relationship("ArgoFloat", back_populates="profiles")
    measurements = relationship("ArgoMeasurement", back_populates="profile", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('float_id', 'cycle_number', name='unique_float_cycle'),
        CheckConstraint('latitude >= -90 AND latitude <= 90', name='valid_profile_lat'),
        CheckConstraint('longitude >= -180 AND longitude <= 180', name='valid_profile_lon'),
        CheckConstraint('max_pressure >= 0', name='positive_max_pressure'),
        CheckConstraint('min_pressure >= -5', name='realistic_min_pressure'),  # Allow small negative pressures
        CheckConstraint('num_levels > 0', name='positive_num_levels'),
        Index('idx_profile_location', 'latitude', 'longitude'),
        Index('idx_profile_date', 'profile_date'),
        Index('idx_profile_quality', 'data_mode', 'qc_flag'),
    )


class ArgoMeasurement(Base):
    """
    Individual measurements within an Argo profile.
    
    Stores the actual oceanographic measurements (temperature, salinity, pressure)
    at different depths/pressure levels within a profile.
    """
    __tablename__ = "argo_measurements"
    
    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), ForeignKey('argo_profiles.id'), nullable=False, index=True)
    level_number = Column(Integer, nullable=False)
    
    # Core measurements
    pressure = Column(Float, nullable=True)  # dbar
    depth = Column(Float, nullable=True)     # meters
    temperature = Column(Float, nullable=True)  # Celsius
    salinity = Column(Float, nullable=True)     # PSU
    
    # Quality control flags
    pressure_qc = Column(String(1), nullable=True, default='1')
    temperature_qc = Column(String(1), nullable=True, default='1')
    salinity_qc = Column(String(1), nullable=True, default='1')
    
    # BGC parameters (optional)
    oxygen = Column(Float, nullable=True)          # μmol/kg
    chlorophyll = Column(Float, nullable=True)     # mg/m³
    ph = Column(Float, nullable=True)              # pH units
    nitrate = Column(Float, nullable=True)         # μmol/kg
    
    # BGC quality flags
    oxygen_qc = Column(String(1), nullable=True)
    chlorophyll_qc = Column(String(1), nullable=True)
    ph_qc = Column(String(1), nullable=True)
    nitrate_qc = Column(String(1), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    profile = relationship("ArgoProfile", back_populates="measurements")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('profile_id', 'level_number', name='unique_profile_level'),
        CheckConstraint('pressure >= -5', name='realistic_pressure'),  # Allow small negative pressures
        CheckConstraint('depth >= 0', name='positive_depth'),
        CheckConstraint('temperature >= -5 AND temperature <= 50', name='realistic_temperature'),
        CheckConstraint('salinity >= 0 AND salinity <= 50', name='realistic_salinity'),
        Index('idx_measurement_pressure', 'pressure'),
        Index('idx_measurement_depth', 'depth'),
        Index('idx_measurement_temp', 'temperature'),
        Index('idx_measurement_salinity', 'salinity'),
    )


class DataSummary(Base):
    """
    Pre-computed summaries and statistics for RAG context.
    
    Stores aggregated information about Argo data that can be used
    to provide context to the LLM without querying raw measurements.
    """
    __tablename__ = "data_summaries"
    
    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    summary_type = Column(String(50), nullable=False)  # profile, float, region, temporal
    
    # Geographic scope
    region_name = Column(String(100), nullable=True)
    min_latitude = Column(Float, nullable=True)
    max_latitude = Column(Float, nullable=True)
    min_longitude = Column(Float, nullable=True)
    max_longitude = Column(Float, nullable=True)
    
    # Temporal scope
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Statistical summaries
    total_profiles = Column(Integer, nullable=True)
    total_measurements = Column(Integer, nullable=True)
    avg_temperature = Column(Float, nullable=True)
    min_temperature = Column(Float, nullable=True)
    max_temperature = Column(Float, nullable=True)
    avg_salinity = Column(Float, nullable=True)
    min_salinity = Column(Float, nullable=True)
    max_salinity = Column(Float, nullable=True)
    avg_depth = Column(Float, nullable=True)
    max_depth = Column(Float, nullable=True)
    
    # Data availability
    has_bgc_data = Column(Boolean, default=False)
    data_quality_score = Column(Float, nullable=True)  # 0-1 score
    
    # Natural language description for RAG
    description = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Constraints
    __table_args__ = (
        Index('idx_summary_region', 'region_name'),
        Index('idx_summary_temporal', 'start_date', 'end_date'),
        Index('idx_summary_geographic', 'min_latitude', 'max_latitude', 'min_longitude', 'max_longitude'),
    )


class VectorEmbedding(Base):
    """
    Vector embeddings for RAG retrieval.
    
    Stores embeddings of data summaries, metadata, and other text
    that can be searched semantically to provide context to the LLM.
    """
    __tablename__ = "vector_embeddings"
    
    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_type = Column(String(50), nullable=False)  # summary, metadata, question, answer
    content_id = Column(String(100), nullable=True)    # Reference to source data
    
    # Content and embedding
    text_content = Column(Text, nullable=False)
    embedding_model = Column(String(100), nullable=False, default='text-embedding-ada-002')
    
    # Note: For PostgreSQL with pgvector, this would be:
    # embedding = Column(Vector(1536), nullable=False)
    # For SQLite development, we'll store as JSON text
    embedding = Column(Text, nullable=False)  # JSON array for development
    
    # Metadata for filtering
    language = Column(String(5), nullable=False, default='en')
    region = Column(String(100), nullable=True)
    data_type = Column(String(50), nullable=True)
    importance = Column(Float, nullable=True, default=1.0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Constraints
    __table_args__ = (
        Index('idx_embedding_content_type', 'content_type'),
        Index('idx_embedding_language', 'language'),
        Index('idx_embedding_region', 'region'),
    )


class ConversationHistory(Base):
    """
    Store conversation history for context and learning.
    
    Keeps track of user questions and system responses to improve
    the RAG system and provide conversation context.
    """
    __tablename__ = "conversation_history"
    
    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(100), nullable=False, index=True)
    
    # Conversation content
    user_query = Column(Text, nullable=False)
    system_response = Column(Text, nullable=False)
    detected_language = Column(String(5), nullable=True)
    
    # Query analysis
    intent = Column(String(100), nullable=True)  # data_query, visualization, export, etc.
    extracted_entities = Column(Text, nullable=True)  # JSON of extracted locations, dates, etc.
    generated_sql = Column(Text, nullable=True)
    
    # Performance metrics
    response_time_ms = Column(Integer, nullable=True)
    user_satisfaction = Column(Integer, nullable=True)  # 1-5 rating if provided
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    
    # Constraints
    __table_args__ = (
        Index('idx_conversation_session', 'session_id'),
        Index('idx_conversation_time', 'created_at'),
        Index('idx_conversation_intent', 'intent'),
    )


# Export all models
__all__ = [
    'Base',
    'ArgoFloat', 
    'ArgoProfile',
    'ArgoMeasurement',
    'DataSummary',
    'VectorEmbedding',
    'ConversationHistory'
]
