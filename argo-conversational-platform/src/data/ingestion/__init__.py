"""Data ingestion package for Argo platform."""

from .argo_fetcher import (
    ERDDAPArgoFetcher,
    fetch_latest_indian_ocean_data
)

__all__ = [
    'ERDDAPArgoFetcher',
    'fetch_latest_indian_ocean_data'
]