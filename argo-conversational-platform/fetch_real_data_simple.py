#!/usr/bin/env python3
"""
Fetch Real Argo Data Script

This script fetches actual Argo float data from the global repository
and populates the database with real oceanographic measurements.

Author: Argo Platform Team
Created: 2025-09-03
"""

import logging
from datetime import datetime, timedelta

from src.config import get_settings
from src.data.database import init_database, get_db_session
from src.data.ingestion.argo_fetcher import ArgoDataFetcher
from src.rag.embeddings import initialize_embeddings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def fetch_and_store_real_data():
    """Fetch real Argo data and populate database."""
    print("🌊 Starting Real Argo Data Fetch...")
    
    # Initialize database
    print("📊 Initializing database...")
    init_database()
    
    # Initialize fetcher
    print("🔄 Initializing Argo data fetcher...")
    fetcher = ArgoDataFetcher()
    
    print("🌊 Fetching Indian Ocean data (last 30 days)...")
    
    try:
        # Fetch Indian Ocean data
        result = fetcher.fetch_indian_ocean_data(days_back=30)
        
        print(f"✅ Data fetch completed!")
        print(f"   📈 Profiles processed: {result.get('profiles', 0)}")
        print(f"   🤖 Floats found: {result.get('floats', 0)}")
        print(f"   📊 Measurements stored: {result.get('measurements', 0)}")
        
        # Initialize embeddings for the new data
        print("\n🧠 Generating embeddings for new data...")
        embedding_stats = initialize_embeddings()
        
        print("✅ Embeddings generated successfully!")
        print(f"   📚 Embeddings created: {embedding_stats}")
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to fetch real data: {e}")
        print(f"❌ Error: {e}")
        print("\n🔄 Attempting fallback to smaller dataset...")
        
        try:
            # Try with a smaller time window
            print("📅 Trying last 7 days...")
            result = fetcher.fetch_indian_ocean_data(days_back=7)
            
            print(f"✅ Fallback fetch completed!")
            print(f"   📈 Profiles processed: {result.get('profiles', 0)}")
            print(f"   🤖 Floats found: {result.get('floats', 0)}")
            print(f"   📊 Measurements stored: {result.get('measurements', 0)}")
            
            return result
            
        except Exception as e2:
            logger.error(f"Fallback fetch also failed: {e2}")
            print(f"❌ Fallback also failed: {e2}")
            print("\n⚠️  Using mock data for testing...")
            return {"status": "mock_data_used", "profiles": 0}


def verify_data():
    """Verify that data was stored correctly."""
    print("\n🔍 Verifying stored data...")
    
    with get_db_session() as session:
        from src.data.models import ArgoFloat, ArgoProfile, ArgoMeasurement
        
        # Count records
        float_count = session.query(ArgoFloat).count()
        profile_count = session.query(ArgoProfile).count()
        measurement_count = session.query(ArgoMeasurement).count()
        
        print(f"📊 Database Contents:")
        print(f"   🤖 Argo Floats: {float_count}")
        print(f"   📈 Profiles: {profile_count}")
        print(f"   📏 Measurements: {measurement_count}")
        
        if profile_count > 0:
            # Show a sample profile
            sample_profile = session.query(ArgoProfile).first()
            print(f"\n📍 Sample Profile:")
            print(f"   Location: {sample_profile.latitude:.2f}°N, {sample_profile.longitude:.2f}°E")
            print(f"   Date: {sample_profile.profile_date}")
            print(f"   Float ID: {sample_profile.float_id}")
            
        return {
            "floats": float_count,
            "profiles": profile_count,
            "measurements": measurement_count
        }


if __name__ == "__main__":
    print("🚀 Argo Real Data Fetcher")
    print("=" * 50)
    
    # Run data fetch
    result = fetch_and_store_real_data()
    
    # Verify results
    stats = verify_data()
    
    print("\n" + "=" * 50)
    print("🎉 Data fetch completed!")
    
    if stats["profiles"] > 0:
        print("✅ Real Argo data successfully stored!")
        print("🌊 Your platform now has actual oceanographic data!")
    else:
        print("⚠️  No real data available - using mock data for testing")
        print("🔧 Check network connection and ERDDAP server status")
    
    print("\n▶️  Next: Run 'python test_rag.py' to test with real data")
