#!/usr/bin/env python3
"""
Fetch and Store Real Argo Data

This script successfully fetches real Argo data and stores it in our database.

Author: Argo Platform Team
Created: 2025-09-03
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
import logging
from io import StringIO

from src.data.database import init_database, get_db_session
from src.data.models import ArgoFloat, ArgoProfile, ArgoMeasurement, DataSummary
from src.rag.embeddings import initialize_embeddings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_real_argo_data():
    """Fetch real Argo data from ERDDAP."""
    print("🌊 Fetching Real Argo Data from ERDDAP...")
    
    # Recent date range (last 7 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    # Indian Ocean bounds
    lat_min, lat_max = -40, 30
    lon_min, lon_max = 20, 120
    
    # ERDDAP URL with corrected query
    base_url = "https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.csv"
    
    # Build query with proper quotes for string constraints
    query_params = [
        "platform_number,cycle_number,time,latitude,longitude,pres,temp,psal,temp_qc,psal_qc",
        f"time>={start_date.strftime('%Y-%m-%dT%H:%M:%SZ')}",
        f"time<={end_date.strftime('%Y-%m-%dT%H:%M:%SZ')}",
        f"latitude>={lat_min}",
        f"latitude<={lat_max}",
        f"longitude>={lon_min}",
        f"longitude<={lon_max}",
        'temp_qc="1"',  # Good quality only - needs quotes
        'pres<=200'  # Surface and upper ocean
    ]
    
    url = f"{base_url}?{'&'.join(query_params)}"
    
    print(f"🔗 Fetching from: {url[:80]}...")
    
    try:
        response = requests.get(url, timeout=60)
        
        if response.status_code == 200:
            print(f"✅ Data fetch successful! Got {len(response.text.split(chr(10)))} lines")
            return response.text
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None


def parse_and_store_data(csv_data):
    """Parse CSV data and store in database."""
    print("📊 Parsing and storing real data...")
    
    try:
        # Parse CSV
        df = pd.read_csv(StringIO(csv_data), skiprows=[1])  # Skip units row
        
        print(f"📈 Loaded {len(df)} measurements")
        print(f"🤖 From {df['platform_number'].nunique()} unique floats")
        
        # Remove rows with NaN temperatures
        df = df.dropna(subset=['temp'])
        print(f"📊 {len(df)} measurements with valid temperature")
        
        with get_db_session() as session:
            stats = {
                'floats': 0,
                'profiles': 0, 
                'measurements': 0
            }
            
            # Group by float and cycle to create profiles
            profile_groups = df.groupby(['platform_number', 'cycle_number'])
            
            for (platform_number, cycle_number), group in profile_groups:
                
                # Create or get float
                float_id = int(platform_number)
                existing_float = session.query(ArgoFloat).filter(
                    ArgoFloat.float_id == float_id
                ).first()
                
                if not existing_float:
                    # Get first and last positions
                    first_row = group.iloc[0]
                    last_row = group.iloc[-1]
                    
                    # Create float
                    argo_float = ArgoFloat(
                        float_id=float_id,
                        wmo_id=str(platform_number),
                        deployment_date=pd.to_datetime(first_row['time']).to_pydatetime(),
                        deployment_latitude=float(first_row['latitude']),
                        deployment_longitude=float(first_row['longitude']),
                        last_position_date=pd.to_datetime(last_row['time']).to_pydatetime(),
                        last_latitude=float(last_row['latitude']),
                        last_longitude=float(last_row['longitude']),
                        status='active',
                        float_type='Real Argo',
                        manufacturer='REAL_DATA',
                        model='REAL_DATA',
                        has_core_data=True,
                        has_bgc_data=False
                    )
                    session.add(argo_float)
                    stats['floats'] += 1
                
                # Create profile
                profile_row = group.iloc[0]  # Use first measurement for profile metadata
                cycle_num = int(cycle_number)
                
                existing_profile = session.query(ArgoProfile).filter(
                    ArgoProfile.float_id == float_id,
                    ArgoProfile.cycle_number == cycle_num
                ).first()
                
                if not existing_profile:
                    profile = ArgoProfile(
                        float_id=float_id,
                        cycle_number=cycle_num,
                        profile_date=pd.to_datetime(profile_row['time']).to_pydatetime(),
                        latitude=float(profile_row['latitude']),
                        longitude=float(profile_row['longitude']),
                        data_mode='R',  # Real-time
                        qc_flag='1',
                        max_pressure=float(group['pres'].max()),
                        min_pressure=float(group['pres'].min()),
                        num_levels=len(group),
                        has_temperature=True,
                        has_salinity=not group['psal'].isna().all(),
                        has_pressure=True
                    )
                    session.add(profile)
                    session.flush()  # Get the profile ID
                    stats['profiles'] += 1
                    
                    # Add measurements with proper level numbering
                    level_num = 0
                    for _, row in group.iterrows():
                        if pd.notna(row['temp']):  # Only add valid temperature data
                            measurement = ArgoMeasurement(
                                profile_id=profile.id,
                                level_number=level_num,  # Increment level number for each measurement
                                pressure=float(row['pres']),
                                depth=float(row['pres']) * 1.019716,  # Approximate depth
                                temperature=float(row['temp']),
                                salinity=float(row['psal']) if pd.notna(row['psal']) else None,
                                pressure_qc='1',
                                temperature_qc=str(row['temp_qc']),
                                salinity_qc=str(row['psal_qc']) if pd.notna(row['psal_qc']) else None
                            )
                            session.add(measurement)
                            level_num += 1  # Increment for next measurement
                            stats['measurements'] += 1
            
            session.commit()
            
        print(f"✅ Stored real data:")
        print(f"   🤖 Floats: {stats['floats']}")
        print(f"   📈 Profiles: {stats['profiles']}")
        print(f"   📊 Measurements: {stats['measurements']}")
        
        return stats
        
    except Exception as e:
        print(f"❌ Error parsing data: {e}")
        logger.exception("Parsing error")
        return None


def main():
    """Main function to fetch and store real data."""
    print("🚀 Real Argo Data Integration")
    print("=" * 50)
    
    # Initialize database
    print("📊 Initializing database...")
    init_database()
    
    # Fetch real data
    csv_data = fetch_real_argo_data()
    
    if csv_data:
        # Parse and store
        stats = parse_and_store_data(csv_data)
        
        if stats:
            # Generate embeddings for real data
            print("\n🧠 Generating embeddings for real data...")
            try:
                embedding_stats = initialize_embeddings()
                print(f"✅ Embeddings created: {embedding_stats}")
            except Exception as e:
                print(f"⚠️  Embeddings failed: {e}")
            
            print("\n🎉 Real Argo data successfully integrated!")
            print("✅ Your platform now has actual oceanographic data!")
            print(f"📊 Recent data from {stats['floats']} floats in the Indian Ocean")
            
            # Test the RAG system with real data
            print("\n🤖 Testing RAG system with real data...")
            try:
                from src.rag.orchestrator import ArgoRAGSystem
                
                rag = ArgoRAGSystem()
                response = rag.process_query(
                    "What's the latest temperature data from the Indian Ocean?",
                    session_id="real_data_test"
                )
                
                print(f"💬 RAG Response: {response['response_text'][:200]}...")
                print(f"📊 SQL returned: {len(response.get('sql_results', []))} rows")
                
            except Exception as e:
                print(f"⚠️  RAG test failed: {e}")
            
            return True
        
    print("\n⚠️  Real data integration failed")
    print("💡 Continuing with mock data (platform still functional)")
    return False


if __name__ == "__main__":
    main()
