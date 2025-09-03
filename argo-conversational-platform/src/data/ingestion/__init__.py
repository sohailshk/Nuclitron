"""Data ingestion package for Argo platform."""

from .argo_fetcher import (
    ArgoDataFetcher,
    fetch_latest_indian_ocean_data,
    fetch_specific_floats
)

__all__ = [
    'ArgoDataFetcher',
    'fetch_latest_indian_ocean_data', 
    'fetch_specific_floats'
]
