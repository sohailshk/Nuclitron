"""
Test configuration loading and basic setup.

This test validates that our environment configuration is working correctly
and all required settings can be loaded.
"""

import pytest
import os
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from src.config import get_settings, get_gemini_api_key


def test_settings_loading():
    """Test that settings can be loaded from environment."""
    settings = get_settings()
    
    # Check core settings exist
    assert settings.app_name == "Argo Conversational Platform"
    assert settings.app_version == "1.0.0"
    assert isinstance(settings.debug, bool)


def test_gemini_api_key():
    """Test that Gemini API key is properly configured."""
    api_key = get_gemini_api_key()
    assert api_key is not None
    assert len(api_key) > 10  # Basic validation


def test_database_configuration():
    """Test database configuration is valid."""
    settings = get_settings()
    
    assert settings.postgres_user
    assert settings.postgres_password
    assert settings.postgres_db
    assert settings.postgres_host
    assert settings.postgres_port > 0


def test_indian_ocean_bounds():
    """Test that Indian Ocean bounds are properly parsed."""
    settings = get_settings()
    bounds = settings.indian_ocean_bounds
    
    # Should be a tuple of 4 floats
    assert isinstance(bounds, tuple)
    assert len(bounds) == 4
    assert all(isinstance(x, float) for x in bounds)
    
    # Basic geographic validation
    lon_min, lon_max, lat_min, lat_max = bounds
    assert -180 <= lon_min <= 180
    assert -180 <= lon_max <= 180
    assert -90 <= lat_min <= 90
    assert -90 <= lat_max <= 90


if __name__ == "__main__":
    pytest.main([__file__])
