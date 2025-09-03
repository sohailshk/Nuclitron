"""
Argo data fetching and ingestion using argopy library.

This module handles fetching Argo data from the global repository
and converting it into our database schema.

Author: Argo Platform Team
Created: 2025-09-03
"""

import logging
from typing import List, Tuple, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session

try:
    from argopy import DataFetcher
    ARGOPY_AVAILABLE = True
except ImportError:
    ARGOPY_AVAILABLE = False
    logging.warning("argopy not available - using mock data for development")

from ...config import get_indian_ocean_bounds, get_settings
from ..models import ArgoFloat, ArgoProfile, ArgoMeasurement, DataSummary
from ..database import get_db_session

logger = logging.getLogger(__name__)


class ArgoDataFetcher:
    """
    Handles fetching and processing Argo data using argopy library.
    
    Provides methods to fetch data by region, float, or profile,
    and convert the xarray datasets into our database models.
    """
    
    def __init__(self):
        """Initialize the Argo data fetcher."""
        self.settings = get_settings()
        
        if ARGOPY_AVAILABLE:
            # Configure argopy data source
            try:
                self.fetcher = DataFetcher(src='erddap')  # Use ERDDAP as default source
                logger.info("Initialized argopy DataFetcher with ERDDAP source")
            except Exception as e:
                logger.warning(f"Failed to initialize argopy: {e}")
                self.fetcher = None
        else:
            self.fetcher = None
            logger.warning("argopy not available - will use mock data")
    
    def fetch_indian_ocean_data(self, days_back: int = 30) -> Dict[str, Any]:
        """
        Fetch recent Argo data from the Indian Ocean region.
        
        Args:
            days_back: Number of days back to fetch data
            
        Returns:
            Dict containing fetched data statistics
        """
        if not self.fetcher:
            return self._create_mock_indian_ocean_data(days_back)
        
        try:
            # Get Indian Ocean bounds
            lon_min, lon_max, lat_min, lat_max = get_indian_ocean_bounds()
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            logger.info(f"Fetching Argo data for Indian Ocean region: "
                       f"lon[{lon_min}, {lon_max}], lat[{lat_min}, {lat_max}], "
                       f"dates[{start_date.date()}, {end_date.date()}]")
            
            # Fetch data using argopy
            argo_data = self.fetcher.region([lon_min, lon_max, lat_min, lat_max, 0, 2000, 
                                           start_date.strftime('%Y-%m-%d'), 
                                           end_date.strftime('%Y-%m-%d')])
            
            # Load the dataset
            ds = argo_data.load().data
            
            # Process and store the data
            stats = self._process_argo_dataset(ds)
            
            logger.info(f"Successfully processed {stats['profiles']} profiles "
                       f"from {stats['floats']} floats")
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to fetch Argo data: {e}")
            # Fall back to mock data
            return self._create_mock_indian_ocean_data(days_back)
    
    def fetch_float_data(self, float_ids: List[int]) -> Dict[str, Any]:
        """
        Fetch data for specific Argo floats.
        
        Args:
            float_ids: List of Argo float IDs
            
        Returns:
            Dict containing fetched data statistics
        """
        if not self.fetcher:
            return self._create_mock_float_data(float_ids)
        
        try:
            logger.info(f"Fetching data for floats: {float_ids}")
            
            argo_data = self.fetcher.float(float_ids)
            ds = argo_data.load().data
            
            stats = self._process_argo_dataset(ds)
            
            logger.info(f"Successfully processed float data: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Failed to fetch float data: {e}")
            return self._create_mock_float_data(float_ids)
    
    def _process_argo_dataset(self, ds) -> Dict[str, Any]:
        """
        Process argopy xarray dataset and store in database.
        
        Args:
            ds: xarray Dataset from argopy
            
        Returns:
            Dict with processing statistics
        """
        stats = {'floats': 0, 'profiles': 0, 'measurements': 0}
        
        with get_db_session() as db:
            # Process unique floats
            unique_floats = ds.PLATFORM_NUMBER.values
            unique_floats = np.unique(unique_floats)
            
            for float_id in unique_floats:
                float_data = ds.where(ds.PLATFORM_NUMBER == float_id, drop=True)
                self._process_float(db, int(float_id), float_data)
                stats['floats'] += 1
            
            # Process profiles and measurements
            for i in range(len(ds.N_PROF)):
                profile_stats = self._process_profile(db, ds, i)
                stats['profiles'] += 1
                stats['measurements'] += profile_stats['measurements']
            
            db.commit()
        
        return stats
    
    def _process_float(self, db: Session, float_id: int, float_data) -> None:
        """Process and store float metadata."""
        try:
            # Check if float already exists
            existing_float = db.query(ArgoFloat).filter(
                ArgoFloat.float_id == float_id
            ).first()
            
            if existing_float:
                return  # Float already exists
            
            # Extract float metadata
            wmo_id = str(float_id)  # Using float_id as WMO ID for simplicity
            
            # Get deployment location (first valid position)
            lats = float_data.LATITUDE.values
            lons = float_data.LONGITUDE.values
            dates = float_data.JULD.values
            
            valid_positions = ~(np.isnan(lats) | np.isnan(lons))
            if np.any(valid_positions):
                first_valid = np.where(valid_positions)[0][0]
                deployment_lat = float(lats[first_valid])
                deployment_lon = float(lons[first_valid])
                deployment_date = pd.to_datetime(dates[first_valid]).to_pydatetime()
                
                # Get last position
                last_valid = np.where(valid_positions)[0][-1]
                last_lat = float(lats[last_valid])
                last_lon = float(lons[last_valid])
                last_date = pd.to_datetime(dates[last_valid]).to_pydatetime()
            else:
                deployment_lat = deployment_lon = None
                deployment_date = last_lat = last_lon = last_date = None
            
            # Create float record
            argo_float = ArgoFloat(
                float_id=float_id,
                wmo_id=wmo_id,
                deployment_date=deployment_date,
                deployment_latitude=deployment_lat,
                deployment_longitude=deployment_lon,
                last_position_date=last_date,
                last_latitude=last_lat,
                last_longitude=last_lon,
                status='active',
                has_core_data=True,
                has_bgc_data=False  # TODO: Detect BGC data availability
            )
            
            db.add(argo_float)
            logger.debug(f"Added float {float_id}")
            
        except Exception as e:
            logger.error(f"Error processing float {float_id}: {e}")
    
    def _process_profile(self, db: Session, ds, profile_idx: int) -> Dict[str, Any]:
        """Process and store individual profile data."""
        stats = {'measurements': 0}
        
        try:
            # Extract profile metadata
            float_id = int(ds.PLATFORM_NUMBER.values[profile_idx])
            cycle_number = int(ds.CYCLE_NUMBER.values[profile_idx]) if 'CYCLE_NUMBER' in ds else profile_idx
            
            lat = float(ds.LATITUDE.values[profile_idx])
            lon = float(ds.LONGITUDE.values[profile_idx])
            date = pd.to_datetime(ds.JULD.values[profile_idx]).to_pydatetime()
            
            # Skip if coordinates are invalid
            if np.isnan(lat) or np.isnan(lon):
                return stats
            
            # Check if profile already exists
            existing_profile = db.query(ArgoProfile).filter(
                ArgoProfile.float_id == float_id,
                ArgoProfile.cycle_number == cycle_number
            ).first()
            
            if existing_profile:
                return stats  # Profile already exists
            
            # Extract data mode and QC flags
            data_mode = 'R'  # Default to real-time
            if 'DATA_MODE' in ds:
                data_mode_val = ds.DATA_MODE.values[profile_idx]
                if isinstance(data_mode_val, bytes):
                    data_mode = data_mode_val.decode('utf-8')
                else:
                    data_mode = str(data_mode_val)
            
            # Get pressure range for this profile
            pressures = ds.PRES.values[profile_idx, :]
            valid_pressures = ~np.isnan(pressures)
            
            if np.any(valid_pressures):
                min_pressure = float(np.min(pressures[valid_pressures]))
                max_pressure = float(np.max(pressures[valid_pressures]))
                num_levels = int(np.sum(valid_pressures))
            else:
                min_pressure = max_pressure = None
                num_levels = 0
            
            # Create profile record
            profile = ArgoProfile(
                float_id=float_id,
                cycle_number=cycle_number,
                profile_date=date,
                latitude=lat,
                longitude=lon,
                data_mode=data_mode,
                qc_flag='1',  # Assume good quality
                max_pressure=max_pressure,
                min_pressure=min_pressure,
                num_levels=num_levels,
                has_temperature='TEMP' in ds,
                has_salinity='PSAL' in ds,
                has_pressure='PRES' in ds
            )
            
            db.add(profile)
            db.flush()  # Get the profile ID
            
            # Process measurements for this profile
            stats['measurements'] = self._process_measurements(db, ds, profile_idx, profile.id)
            
            logger.debug(f"Added profile {float_id}/{cycle_number} with {stats['measurements']} measurements")
            
        except Exception as e:
            logger.error(f"Error processing profile {profile_idx}: {e}")
        
        return stats
    
    def _process_measurements(self, db: Session, ds, profile_idx: int, profile_id: str) -> int:
        """Process and store measurements for a profile."""
        measurement_count = 0
        
        try:
            # Get data arrays for this profile
            pressures = ds.PRES.values[profile_idx, :]
            temperatures = ds.TEMP.values[profile_idx, :] if 'TEMP' in ds else None
            salinities = ds.PSAL.values[profile_idx, :] if 'PSAL' in ds else None
            
            # Process each level
            for level_idx, pressure in enumerate(pressures):
                if np.isnan(pressure):
                    continue
                
                # Extract values for this level
                temp = float(temperatures[level_idx]) if temperatures is not None and not np.isnan(temperatures[level_idx]) else None
                sal = float(salinities[level_idx]) if salinities is not None and not np.isnan(salinities[level_idx]) else None
                
                # Calculate depth from pressure (approximate)
                depth = float(pressure * 1.019716) if pressure > 0 else None
                
                # Create measurement record
                measurement = ArgoMeasurement(
                    profile_id=profile_id,
                    level_number=level_idx,
                    pressure=float(pressure),
                    depth=depth,
                    temperature=temp,
                    salinity=sal,
                    pressure_qc='1',
                    temperature_qc='1' if temp is not None else None,
                    salinity_qc='1' if sal is not None else None
                )
                
                db.add(measurement)
                measurement_count += 1
        
        except Exception as e:
            logger.error(f"Error processing measurements for profile {profile_id}: {e}")
        
        return measurement_count
    
    def _create_mock_indian_ocean_data(self, days_back: int) -> Dict[str, Any]:
        """Create mock data for development when argopy is not available."""
        logger.info("Creating mock Indian Ocean data for development")
        
        try:
            with get_db_session() as db:
                stats = {'floats': 0, 'profiles': 0, 'measurements': 0, 'mock': True}
                
                # Create a mock float
                float_id = 999999
                
                # Check if mock float already exists
                existing_float = db.query(ArgoFloat).filter(
                    ArgoFloat.float_id == float_id
                ).first()
                
                if not existing_float:
                    # Create mock float
                    mock_float = ArgoFloat(
                        float_id=float_id,
                        wmo_id="999999",
                        deployment_date=datetime.now() - timedelta(days=days_back),
                        deployment_latitude=-15.5,  # Indian Ocean
                        deployment_longitude=72.3,   # Indian Ocean
                        last_position_date=datetime.now() - timedelta(days=1),
                        last_latitude=-15.2,
                        last_longitude=72.8,
                        status='active',
                        float_type='APEX',
                        manufacturer='Teledyne Webb Research',
                        model='APEX',
                        has_core_data=True,
                        has_bgc_data=False
                    )
                    db.add(mock_float)
                    stats['floats'] += 1
                
                # Create mock profiles for the last few days
                for day in range(min(days_back, 5)):  # Create 5 profiles max
                    profile_date = datetime.now() - timedelta(days=day)
                    cycle_number = day + 1
                    
                    # Check if profile already exists
                    existing_profile = db.query(ArgoProfile).filter(
                        ArgoProfile.float_id == float_id,
                        ArgoProfile.cycle_number == cycle_number
                    ).first()
                    
                    if not existing_profile:
                        # Create mock profile with slight position drift
                        lat_drift = day * 0.1
                        lon_drift = day * 0.1
                        
                        mock_profile = ArgoProfile(
                            float_id=float_id,
                            cycle_number=cycle_number,
                            profile_date=profile_date,
                            latitude=-15.5 + lat_drift,
                            longitude=72.3 + lon_drift,
                            data_mode='R',
                            qc_flag='1',
                            max_pressure=2000.0,
                            min_pressure=5.0,
                            num_levels=50,
                            has_temperature=True,
                            has_salinity=True,
                            has_pressure=True
                        )
                        db.add(mock_profile)
                        db.flush()  # Get the profile ID
                        
                        stats['profiles'] += 1
                        
                        # Create mock measurements for this profile
                        for level in range(50):  # 50 depth levels
                            pressure = 5.0 + (level * 40.0)  # 5 to 2000 dbar
                            depth = pressure * 1.019716  # Convert to depth
                            
                            # Create realistic temperature and salinity profiles
                            # Temperature decreases with depth
                            temp = 28.0 - (depth * 0.01)  # Simple thermocline
                            if temp < 2.0:
                                temp = 2.0  # Deep water minimum
                            
                            # Salinity - typical Indian Ocean values
                            sal = 34.7 + (depth * 0.0001)  # Slight increase with depth
                            if sal > 36.5:
                                sal = 36.5  # Maximum realistic value
                            
                            mock_measurement = ArgoMeasurement(
                                profile_id=mock_profile.id,
                                level_number=level,
                                pressure=pressure,
                                depth=depth,
                                temperature=temp,
                                salinity=sal,
                                pressure_qc='1',
                                temperature_qc='1',
                                salinity_qc='1'
                            )
                            db.add(mock_measurement)
                            stats['measurements'] += 1
                
                db.commit()
                logger.info(f"Created mock data: {stats}")
                return stats
                
        except Exception as e:
            logger.error(f"Failed to create mock data: {e}")
            return {'floats': 0, 'profiles': 0, 'measurements': 0, 'mock': True, 'error': str(e)}
    
    def _create_mock_float_data(self, float_ids: List[int]) -> Dict[str, Any]:
        """Create mock float data for development."""
        logger.info(f"Creating mock data for floats: {float_ids}")
        return {'floats': len(float_ids), 'profiles': 0, 'measurements': 0, 'mock': True}


def fetch_latest_indian_ocean_data(days_back: int = 7) -> Dict[str, Any]:
    """
    Convenience function to fetch latest Indian Ocean data.
    
    Args:
        days_back: Number of days back to fetch
        
    Returns:
        Dict with fetch statistics
    """
    fetcher = ArgoDataFetcher()
    return fetcher.fetch_indian_ocean_data(days_back)


def fetch_specific_floats(float_ids: List[int]) -> Dict[str, Any]:
    """
    Convenience function to fetch specific float data.
    
    Args:
        float_ids: List of float IDs to fetch
        
    Returns:
        Dict with fetch statistics
    """
    fetcher = ArgoDataFetcher()
    return fetcher.fetch_float_data(float_ids)


# Export main functions
__all__ = [
    'ArgoDataFetcher',
    'fetch_latest_indian_ocean_data',
    'fetch_specific_floats'
]
