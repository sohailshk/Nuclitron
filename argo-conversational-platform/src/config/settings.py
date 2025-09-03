"""
Configuration management for Argo Conversational Platform.

This module handles all application settings, environment variables,
and configuration validation for the platform.

Author: Argo Platform Team
Created: 2025-09-03
"""

import os
from typing import List, Optional, Tuple
from pydantic import validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    
    Automatically loads from .env file and environment variables.
    Provides validation and type conversion for all configuration values.
    """
    
    # ========================================
    # API Keys & External Services
    # ========================================
    gemini_api_key: str
    openai_api_key: Optional[str] = None
    google_maps_api_key: Optional[str] = None
    google_translate_api_key: Optional[str] = None
    
    # ========================================
    # Database Configuration
    # ========================================
    database_url: str = "postgresql://argo_user:argo_pass@localhost:5432/argo_db"
    postgres_user: str = "argo_user"
    postgres_password: str = "argo_pass"
    postgres_db: str = "argo_db"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    
    # ========================================
    # Application Settings
    # ========================================
    app_name: str = "Argo Conversational Platform"
    app_version: str = "1.0.0"
    debug: bool = True
    log_level: str = "INFO"
    
    # Server Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    streamlit_port: int = 8501
    
    # ========================================
    # RAG & Vector Database
    # ========================================
    vector_dimension: int = 1536
    embedding_model: str = "text-embedding-ada-002"
    max_context_length: int = 4000
    
    # ========================================
    # Data Configuration
    # ========================================
    argo_cache_dir: str = "./data/cache"
    data_update_interval: int = 30  # minutes
    default_region: str = "indian_ocean"
    
    # Geographic bounds for Indian Ocean (lon_min, lon_max, lat_min, lat_max)
    indian_ocean_bounds: str = "-90,90,-40,30"
    
    # ========================================
    # Language & Localization
    # ========================================
    default_language: str = "auto"
    supported_languages: str = "en,hi"
    
    # ========================================
    # Security & Deployment
    # ========================================
    secret_key: str = "your_secret_key_change_this_in_production"
    allowed_hosts: str = "localhost,127.0.0.1,*.render.com"
    cors_origins: str = "http://localhost:8501,http://localhost:3000"
    
    # ========================================
    # Development Settings
    # ========================================
    development_mode: bool = True
    reload_on_change: bool = True
    
    # ========================================
    # Validators
    # ========================================
    
    @validator('indian_ocean_bounds')
    def parse_bounds(cls, v) -> Tuple[float, float, float, float]:
        """Parse geographic bounds string into tuple of floats."""
        try:
            bounds = [float(x.strip()) for x in v.split(',')]
            if len(bounds) != 4:
                raise ValueError("Bounds must have exactly 4 values")
            return tuple(bounds)
        except (ValueError, AttributeError):
            raise ValueError("Invalid bounds format. Use: lon_min,lon_max,lat_min,lat_max")
    
    @validator('supported_languages')
    def parse_languages(cls, v) -> List[str]:
        """Parse supported languages string into list."""
        return [lang.strip() for lang in v.split(',')]
    
    @validator('allowed_hosts')
    def parse_hosts(cls, v) -> List[str]:
        """Parse allowed hosts string into list."""
        return [host.strip() for host in v.split(',')]
    
    @validator('cors_origins')
    def parse_origins(cls, v) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in v.split(',')]
    
    @validator('log_level')
    def validate_log_level(cls, v):
        """Validate log level is one of the standard levels."""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f"Log level must be one of: {valid_levels}")
        return v.upper()
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    Returns:
        Settings: Application configuration object
        
    This function is cached to avoid re-reading environment variables
    on every call. Use this instead of instantiating Settings directly.
    """
    return Settings()


def get_database_url() -> str:
    """
    Get the complete database URL for SQLAlchemy.
    
    Returns:
        str: Formatted database URL
    """
    settings = get_settings()
    return settings.database_url


def get_indian_ocean_bounds() -> Tuple[float, float, float, float]:
    """
    Get the geographic bounds for the Indian Ocean region.
    
    Returns:
        Tuple[float, float, float, float]: (lon_min, lon_max, lat_min, lat_max)
    """
    settings = get_settings()
    return settings.indian_ocean_bounds


def is_development() -> bool:
    """
    Check if running in development mode.
    
    Returns:
        bool: True if in development mode
    """
    return get_settings().development_mode


def get_gemini_api_key() -> str:
    """
    Get the Google Gemini API key.
    
    Returns:
        str: Gemini API key
        
    Raises:
        ValueError: If API key is not configured
    """
    settings = get_settings()
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY not configured")
    return settings.gemini_api_key


# Export commonly used settings
__all__ = [
    'Settings',
    'get_settings',
    'get_database_url', 
    'get_indian_ocean_bounds',
    'is_development',
    'get_gemini_api_key'
]
