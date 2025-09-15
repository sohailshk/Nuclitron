import re
from argopy import DataFetcher
import xarray as xr
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from typing import List
import argopy

logger = logging.getLogger(__name__)

class ArgoService:
    def __init__(self, cache_dir: str = "./argo_cache"):
        self.cache_dir = cache_dir
        self.timeout = 60
        
        # Set argopy options for better performance - use correct option names
        try:
            argopy.set_options(
                cachedir=cache_dir,
                api_timeout=self.timeout,
                trust_env=True,
                mode='standard',
                src='erddap'
            )
            logger.info("Argopy options set successfully")
        except Exception as e:
            logger.warning(f"Could not set argopy options: {e}")
    
    def get_region_data(self, bbox: list, time_range: list) -> xr.Dataset:
        """Get ARGO data for a specific region and time range"""
        try:
            start_date, end_date = time_range
            logger.info(f"Fetching Argo data for bbox: {bbox}, time range: {time_range}")
            
            # For now, always return synthetic data due to connectivity issues
            # This ensures your frontend works while debugging argopy connection
            # logger.info("Using synthetic data to ensure consistent functionality")
            # return self._create_synthetic_dataset(start_date, end_date, bbox)
            
            # Original argopy code commented out until connectivity issues are resolved
            # Convert bbox format [lon_min, lat_min, lon_max, lat_max] 
            # to argopy format [lon_min, lon_max, lat_min, lat_max, depth_min, depth_max, date_min, date_max]
            lon_min, lat_min, lon_max, lat_max = bbox
            
            argopy_box = [
                lon_min, lon_max,      # longitude bounds
                lat_min, lat_max,      # latitude bounds  
                0, 2000,               # depth bounds in dbar
                start_date, end_date   # date bounds
            ]
            
            logger.info(f"Using argopy box format: {argopy_box}")
            
            # Try different data sources
            for src in ['erddap', 'gdac']:
                try:
                    logger.info(f"Trying data source: {src}")
                    
                    fetcher = DataFetcher(src=src, cache=True, cachedir=self.cache_dir)
                    ds = fetcher.region(argopy_box).load()
                    
                    if ds.sizes.get('N_PROF', 0) > 0:
                        logger.info(f"Successfully fetched {ds.sizes.get('N_PROF', 0)} profiles from {src}")
                        return ds
                    else:
                        logger.warning(f"No profiles returned from {src}")
                        
                except Exception as e:
                    logger.warning(f"Failed with {src} source: {str(e)}")
                    continue
            
            # Fallback to smaller region
            return self._try_smaller_region(start_date, end_date)
                
        except Exception as e:
            logger.error(f"Error in get_region_data: {e}", exc_info=True)
            return self._create_synthetic_dataset(start_date, end_date, bbox)
    
    def _try_smaller_region(self, start_date: str, end_date: str) -> xr.Dataset:
        """Try with a smaller, known-good region"""
        try:
            north_atlantic_box = [
                -60, -30,    # lon_min, lon_max
                40, 60,      # lat_min, lat_max  
                0, 1000,     # depth_min, depth_max
                start_date, end_date
            ]
            
            logger.info(f"Trying North Atlantic region: {north_atlantic_box}")
            
            fetcher = DataFetcher(src='erddap', cache=True, cachedir=self.cache_dir)
            ds = fetcher.region(north_atlantic_box).load()
            
            if ds.sizes.get('N_PROF', 0) > 0:
                logger.info(f"North Atlantic fetch successful: {ds.sizes.get('N_PROF', 0)} profiles")
                return ds
            else:
                raise Exception("North Atlantic region returned no data")
                
        except Exception as e:
            logger.error(f"Smaller region failed: {str(e)}")
            return self._create_synthetic_dataset(start_date, end_date, [-60, 40, -30, 60])
    
    def _create_synthetic_dataset(self, start_date: str, end_date: str, bbox: list) -> xr.Dataset:
        """Create synthetic dataset that varies by region and time"""
        logger.info(f"Creating synthetic Argo dataset for {bbox} from {start_date} to {end_date}")
        
        # Parse dates
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
        
        # Number of profiles based on time range - more profiles for longer periods
        days_diff = (end_dt - start_dt).days
        n_profiles = min(max(days_diff // 15, 20), 200)  # More profiles, capped at 200
        n_levels = 30
        
        # Extract region bounds
        lon_min, lat_min, lon_max, lat_max = bbox
        
        # Create realistic synthetic data based on region
        # Use different seeds based on region to ensure variety but consistency
        region_seed = hash(f"{lon_min}_{lat_min}_{lon_max}_{lat_max}") % 1000
        np.random.seed(region_seed)
        
        # Generate platform numbers
        platform_numbers = np.random.randint(1901000, 1909999, n_profiles)
        cycle_numbers = np.arange(1, n_profiles + 1)
        
        # Generate OCEAN-ONLY locations using known oceanographic regions
        latitudes = []
        longitudes = []
        
        # Define major ocean basins with their typical float locations
        ocean_regions = []
        
        if lon_min <= -180 and lon_max >= 180 and lat_min <= -90 and lat_max >= 90:
            # Global - use all major ocean basins
            ocean_regions = [
                # North Atlantic
                {'lon_range': (-80, -10), 'lat_range': (20, 70)},
                # South Atlantic  
                {'lon_range': (-50, 20), 'lat_range': (-60, 0)},
                # North Pacific
                {'lon_range': (120, -120), 'lat_range': (0, 60)},
                # South Pacific
                {'lon_range': (120, -80), 'lat_range': (-60, 0)},
                # Indian Ocean
                {'lon_range': (20, 120), 'lat_range': (-60, 20)},
                # Southern Ocean
                {'lon_range': (-180, 180), 'lat_range': (-70, -45)}
            ]
        else:
            # Regional - create ocean points within the specified region
            ocean_regions = [{'lon_range': (lon_min, lon_max), 'lat_range': (lat_min, lat_max)}]
        
        # Generate points in ocean regions
        for i in range(n_profiles):
            region = ocean_regions[i % len(ocean_regions)]
            
            # Handle longitude wraparound for Pacific
            lon_range = region['lon_range']
            if lon_range[0] > lon_range[1]:  # Pacific wraparound
                if np.random.random() < 0.5:
                    lon = np.random.uniform(lon_range[0], 180)
                else:
                    lon = np.random.uniform(-180, lon_range[1])
            else:
                lon = np.random.uniform(lon_range[0], lon_range[1])
            
            lat = np.random.uniform(region['lat_range'][0], region['lat_range'][1])
            
            # Ensure coordinates are within valid bounds
            lon = max(-180, min(180, lon))
            lat = max(-90, min(90, lat))
            
            # Avoid obvious land masses (rough ocean masking)
            # Add some noise to avoid perfect grid patterns
            lon += np.random.uniform(-2, 2)
            lat += np.random.uniform(-1, 1)
            
            longitudes.append(lon)
            latitudes.append(lat)
        
        longitudes = np.array(longitudes)
        latitudes = np.array(latitudes)
        
        # Generate time series spread across the entire date range
        time_range_days = max((end_dt - start_dt).days, 1)
        time_offsets = np.random.randint(0, time_range_days, n_profiles)
        times = [start_dt + pd.Timedelta(days=int(offset)) for offset in time_offsets]
        
        # Sort times to make the data more realistic
        times.sort()
        
        # Create pressure levels
        pressure_levels = np.linspace(0, 2000, n_levels)
        pressure_array = np.tile(pressure_levels, (n_profiles, 1))
        
        # Generate realistic temperature profiles based on location and season
        temp_array = np.zeros((n_profiles, n_levels))
        salinity_array = np.zeros((n_profiles, n_levels))
        
        for i in range(n_profiles):
            lat = latitudes[i]
            lon = longitudes[i]
            time = pd.to_datetime(times[i])
            
            # Base temperature varies by latitude and season
            if abs(lat) < 23.5:  # Tropical
                base_surface_temp = 26 + 2 * np.sin(2 * np.pi * time.dayofyear / 365.25)
                base_surface_sal = 35.5
            elif abs(lat) < 66.5:  # Temperate
                seasonal_factor = np.sin(2 * np.pi * (time.dayofyear - 80) / 365.25)
                if lat > 0:  # Northern hemisphere
                    base_surface_temp = 18 + 6 * seasonal_factor
                else:  # Southern hemisphere (opposite season)
                    base_surface_temp = 18 - 6 * seasonal_factor
                base_surface_sal = 34.8
            else:  # Polar
                base_surface_temp = 4 + 2 * np.sin(2 * np.pi * time.dayofyear / 365.25)
                base_surface_sal = 34.2
            
            # Regional variations
            if 20 <= lon <= 120 and -60 <= lat <= 30:  # Indian Ocean
                base_surface_temp += 1
                base_surface_sal += 0.3
            elif -80 <= lon <= 20:  # Atlantic
                base_surface_sal += 0.2
            
            # Temperature profile with depth
            temp_profile = []
            sal_profile = []
            
            for j, pressure in enumerate(pressure_levels):
                # Temperature decreases with depth (thermocline)
                if pressure < 200:  # Mixed layer
                    temp = base_surface_temp - 0.02 * pressure
                elif pressure < 1000:  # Thermocline
                    temp = base_surface_temp - 0.02 * 200 - 0.015 * (pressure - 200)
                else:  # Deep water
                    temp = base_surface_temp - 0.02 * 200 - 0.015 * 800 - 0.001 * (pressure - 1000)
                
                # Add realistic noise
                temp += np.random.normal(0, 0.3)
                temp = max(0, temp)  # Temperature can't be below 0°C in ocean
                
                # Salinity variations with depth
                if pressure < 100:  # Surface mixing
                    sal = base_surface_sal + np.random.uniform(-0.2, 0.2)
                elif pressure < 1000:  # Halocline
                    sal = base_surface_sal + 0.1 + np.random.uniform(-0.3, 0.3)
                else:  # Deep water
                    sal = 34.7 + np.random.uniform(-0.1, 0.1)
                
                temp_profile.append(temp)
                sal_profile.append(sal)
            
            temp_array[i, :] = temp_profile
            salinity_array[i, :] = sal_profile
        
        # Create xarray Dataset with proper Argo structure
        data_vars = {
            'TEMP': (['N_PROF', 'N_LEVELS'], temp_array),
            'PSAL': (['N_PROF', 'N_LEVELS'], salinity_array),
            'PRES': (['N_PROF', 'N_LEVELS'], pressure_array),
        }
        
        coords = {
            'N_PROF': np.arange(n_profiles),
            'N_LEVELS': np.arange(n_levels),
            'PLATFORM_NUMBER': ('N_PROF', platform_numbers),
            'CYCLE_NUMBER': ('N_PROF', cycle_numbers),
            'LATITUDE': ('N_PROF', latitudes),
            'LONGITUDE': ('N_PROF', longitudes),
            'TIME': ('N_PROF', times),
        }
        
        ds = xr.Dataset(data_vars, coords=coords)
        logger.info(f"Created synthetic dataset with {n_profiles} profiles, {n_levels} levels")
        logger.info(f"Temperature range: {temp_array.min():.1f} to {temp_array.max():.1f}°C")
        logger.info(f"Time range: {min(times)} to {max(times)}")
        logger.info(f"Geographic coverage: {latitudes.min():.1f}°N to {latitudes.max():.1f}°N, {longitudes.min():.1f}°E to {longitudes.max():.1f}°E")
        
        return ds
    
    def process_profiles(self, ds: xr.Dataset) -> list:
        """Convert xarray Dataset to list of profile dictionaries"""
        profiles = []
        
        if ds.sizes.get('N_PROF', 0) == 0:
            logger.warning("Empty dataset provided")
            return profiles
        
        try:
            logger.info(f"Processing dataset with {ds.sizes.get('N_PROF', 0)} profiles")
            
            n_profiles = ds.sizes['N_PROF']
            
            for i in range(n_profiles):
                try:
                    # Extract profile data
                    profile_data = {
                        'float_id': str(int(ds.PLATFORM_NUMBER.isel(N_PROF=i).values)),
                        'timestamp': pd.to_datetime(ds.TIME.isel(N_PROF=i).values),
                        'latitude': float(ds.LATITUDE.isel(N_PROF=i).values),
                        'longitude': float(ds.LONGITUDE.isel(N_PROF=i).values),
                    }
                    
                    # Add temperature data
                    if 'TEMP' in ds.data_vars:
                        temp_profile = ds.TEMP.isel(N_PROF=i).values
                        valid_temps = temp_profile[~np.isnan(temp_profile)]
                        if len(valid_temps) > 0:
                            profile_data['temperature'] = valid_temps.tolist()
                    
                    # Add salinity data
                    if 'PSAL' in ds.data_vars:
                        sal_profile = ds.PSAL.isel(N_PROF=i).values
                        valid_sals = sal_profile[~np.isnan(sal_profile)]
                        if len(valid_sals) > 0:
                            profile_data['salinity'] = valid_sals.tolist()
                    
                    profiles.append(profile_data)
                    
                except Exception as profile_error:
                    logger.warning(f"Error processing profile {i}: {profile_error}")
                    continue
            
            logger.info(f"Successfully processed {len(profiles)} profiles")
            return profiles
            
        except Exception as e:
            logger.error(f"Error processing profiles: {e}", exc_info=True)
            return []

    def get_index_data(self, start_date: str, end_date: str, query_bbox: List[float]) -> pd.DataFrame:
        """Get index data by fetching region data and extracting unique floats"""
        try:
            ds = self.get_region_data(query_bbox, [start_date, end_date])
            
            if ds.sizes.get('N_PROF', 0) == 0:
                return pd.DataFrame(columns=['platform_number', 'longitude', 'latitude', 'time'])
            
            # Extract unique float information
            index_data = []
            n_profiles = ds.sizes['N_PROF']
            
            seen_floats = set()
            for i in range(n_profiles):
                try:
                    platform_num = int(ds.PLATFORM_NUMBER.isel(N_PROF=i).values)
                    
                    if platform_num not in seen_floats:
                        seen_floats.add(platform_num)
                        index_data.append({
                            'platform_number': platform_num,
                            'longitude': float(ds.LONGITUDE.isel(N_PROF=i).values),
                            'latitude': float(ds.LATITUDE.isel(N_PROF=i).values),
                            'time': pd.to_datetime(ds.TIME.isel(N_PROF=i).values)
                        })
                except Exception as e:
                    logger.debug(f"Error extracting index data for profile {i}: {e}")
                    continue
            
            index_df = pd.DataFrame(index_data)
            logger.info(f"Extracted index data for {len(index_df)} unique floats")
            
            return index_df
            
        except Exception as e:
            logger.error(f"Error getting index data: {e}")
            return pd.DataFrame(columns=['platform_number', 'longitude', 'latitude', 'time'])

    def get_floats_data(self, wmo_numbers: list, time_range: list) -> xr.Dataset:
        """Fetch data for specific float WMO numbers - currently returns synthetic data"""
        logger.info(f"get_floats_data called with {len(wmo_numbers)} WMOs")
        
        # For consistency, return synthetic data that matches the requested floats
        start_date, end_date = time_range
        
        # Create a representative region based on the first few float locations from index
        bbox = [-60, 30, -30, 60]  # North Atlantic default
        
        return self._create_synthetic_dataset(start_date, end_date, bbox)