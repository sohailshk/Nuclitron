#!/usr/bin/env python3
"""
Test Real Argo Data Connection

This script tests different approaches to get real Argo data.

Author: Argo Platform Team
Created: 2025-09-03
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_erddap_connection():
    """Test ERDDAP server connection."""
    print("🌊 Testing ERDDAP Connection...")
    
    # Test basic connectivity
    base_url = "https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats"
    
    try:
        # Test if server is responding
        response = requests.get(f"{base_url}.html", timeout=10)
        print(f"✅ ERDDAP server responding: {response.status_code}")
        
        if response.status_code == 200:
            print("🎯 Server is online!")
            return True
        else:
            print(f"⚠️  Server returned: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERDDAP connection failed: {e}")
        return False


def test_small_data_fetch():
    """Try to fetch a small amount of real data."""
    print("\n📊 Testing Small Data Fetch...")
    
    # Recent date range (last 7 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    # Indian Ocean bounds
    lat_min, lat_max = -40, 30
    lon_min, lon_max = 20, 120
    
    # Construct ERDDAP URL for small sample
    base_url = "https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.csv"
    
    # Select only essential variables
    variables = "platform_number,cycle_number,time,latitude,longitude,pres,temp,psal,temp_qc,psal_qc"
    
    # Build query parameters
    params = {
        'platform_number,cycle_number,time,latitude,longitude,pres,temp,psal,temp_qc,psal_qc': '',
        'time>=': start_date.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'time<=': end_date.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'latitude>=': lat_min,
        'latitude<=': lat_max, 
        'longitude>=': lon_min,
        'longitude<=': lon_max,
        'temp_qc=': '"1"',  # Good quality only - needs quotes for strings
        'pres<=': 100  # Surface data only for testing
    }
    
    # Construct URL
    query_params = []
    for key, value in params.items():
        if value != '':
            query_params.append(f"{key}{value}")
        else:
            query_params.append(key)
    
    url = f"{base_url}?{'&'.join(query_params)}"
    
    print(f"🔗 Trying URL: {url[:100]}...")
    
    try:
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            print("✅ Data fetch successful!")
            
            # Try to parse CSV
            try:
                lines = response.text.split('\n')
                print(f"📄 Response has {len(lines)} lines")
                
                if len(lines) > 2:  # Header + at least one data row
                    print("📊 Sample data:")
                    for i, line in enumerate(lines[:5]):  # Show first 5 lines
                        print(f"   {i}: {line}")
                    
                    return True, response.text
                else:
                    print("⚠️  No data found for this time period")
                    return False, "No data"
                    
            except Exception as e:
                print(f"❌ Error parsing response: {e}")
                return False, str(e)
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False, f"HTTP {response.status_code}"
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False, str(e)


def test_argopy_direct():
    """Test argopy library directly."""
    print("\n🐍 Testing argopy Library...")
    
    try:
        from argopy import DataFetcher
        
        # Initialize fetcher
        fetcher = DataFetcher(src='erddap')
        print("✅ argopy imported successfully")
        
        # Try to fetch a small region
        print("🌊 Trying to fetch small region...")
        
        try:
            # Very small region and recent time
            end_date = datetime.now()
            start_date = end_date - timedelta(days=3)
            
            # Small region in Indian Ocean with pressure range
            ds = fetcher.region(
                [-30, -20, 70, 80, 0, 100,  # Small box with pressure 0-100 dbar
                 start_date.strftime('%Y-%m-%d'), 
                 end_date.strftime('%Y-%m-%d')]
            ).to_xarray()
            
            print(f"✅ Got dataset with {len(ds.N_PROF)} profiles")
            print(f"📊 Variables: {list(ds.data_vars.keys())}")
            
            return True, ds
            
        except Exception as e:
            print(f"❌ argopy fetch failed: {e}")
            return False, str(e)
            
    except ImportError:
        print("❌ argopy not available")
        return False, "argopy not installed"


def suggest_alternatives():
    """Suggest alternative data sources."""
    print("\n🔄 Alternative Data Sources:")
    print("1. 📁 Use local NetCDF files if you have them")
    print("2. 🌐 Try different ERDDAP servers:")
    print("   - https://www.ifremer.fr/erddap/")
    print("   - https://data.argo.org.uk/")
    print("   - https://coastwatch.pfeg.noaa.gov/erddap/")
    print("3. 📊 Download sample files from Argo website")
    print("4. 🔄 Retry later (ERDDAP servers can be temporarily down)")
    print("5. ✨ Continue with mock data for now (fully functional)")


def main():
    """Test real data access options."""
    print("🚀 Real Argo Data Access Test")
    print("=" * 50)
    
    # Test 1: ERDDAP connectivity
    erddap_ok = test_erddap_connection()
    
    # Test 2: Small data fetch
    if erddap_ok:
        success, result = test_small_data_fetch()
        if success:
            print("\n🎉 Real data access working!")
            return True
    
    # Test 3: argopy direct
    success, result = test_argopy_direct()
    if success:
        print("\n🎉 argopy real data access working!")
        return True
    
    # If all tests fail
    print("\n⚠️  Real data access currently unavailable")
    suggest_alternatives()
    
    print("\n💡 Recommendation:")
    print("Continue with mock data for now - the platform is fully functional!")
    print("You can switch to real data later when servers are available.")
    
    return False


if __name__ == "__main__":
    main()
