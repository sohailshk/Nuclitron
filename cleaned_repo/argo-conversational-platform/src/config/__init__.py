"""Configuration package for Argo Conversational Platform."""

from .settings import (
    Settings,
    get_settings,
    get_database_url,
    get_indian_ocean_bounds,
    is_development,
    get_gemini_api_key
)

__all__ = [
    'Settings',
    'get_settings', 
    'get_database_url',
    'get_indian_ocean_bounds',
    'is_development',
    'get_gemini_api_key'
]
