"""
Test database setup and basic data ingestion.

This script tests that our database models work correctly
and that we can fetch and store Argo data.
"""

import sys
import logging
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent.parent
src_path = project_root / "src"
sys.path.insert(0, str(src_path))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_database_setup():
    """Test database initialization and connection."""
    print("🗄️  Testing database setup...")
    
    try:
        from src.data.database import init_database, check_database_connection
        from src.data.models import ArgoFloat, ArgoProfile, DataSummary
        
        # Initialize database
        print("   Initializing database...")
        init_database()
        print("   ✅ Database initialized")
        
        # Test connection
        print("   Testing connection...")
        if check_database_connection():
            print("   ✅ Database connection working")
        else:
            print("   ❌ Database connection failed")
            return False
        
        # Test basic queries
        from src.data.database import get_db_session
        with get_db_session() as db:
            # Count existing records
            float_count = db.query(ArgoFloat).count()
            profile_count = db.query(ArgoProfile).count()
            summary_count = db.query(DataSummary).count()
            
            print(f"   📊 Current data: {float_count} floats, {profile_count} profiles, {summary_count} summaries")
        
        print("   ✅ Database setup successful")
        return True
        
    except Exception as e:
        print(f"   ❌ Database setup failed: {e}")
        return False


def test_argo_data_fetching():
    """Test Argo data fetching capabilities."""
    print("\n🌊 Testing Argo data fetching...")
    
    try:
        from src.data.ingestion import ArgoDataFetcher
        
        # Create fetcher instance
        fetcher = ArgoDataFetcher()
        print("   ✅ Argo data fetcher initialized")
        
        # Test a small data fetch (mock or real)
        print("   Attempting to fetch recent Indian Ocean data...")
        stats = fetcher.fetch_indian_ocean_data(days_back=7)
        
        print(f"   📊 Fetch results: {stats}")
        
        if stats.get('mock'):
            print("   ⚠️  Using mock data (argopy not available)")
        else:
            print("   ✅ Real Argo data fetched successfully")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Argo data fetching failed: {e}")
        return False


def test_data_storage():
    """Test storing and retrieving data."""
    print("\n💾 Testing data storage...")
    
    try:
        from src.data.database import get_db_session
        from src.data.models import ArgoFloat, DataSummary
        from datetime import datetime
        
        with get_db_session() as db:
            # Create a test float
            test_float = ArgoFloat(
                float_id=999999,
                wmo_id="TEST999999",
                deployment_date=datetime.now(),
                deployment_latitude=15.0,
                deployment_longitude=75.0,
                last_latitude=16.0,
                last_longitude=76.0,
                status='active',
                has_core_data=True
            )
            
            # Check if already exists
            existing = db.query(ArgoFloat).filter(ArgoFloat.float_id == 999999).first()
            if not existing:
                db.add(test_float)
                db.commit()
                print("   ✅ Test float stored successfully")
            else:
                print("   ✅ Test float already exists")
            
            # Test retrieval
            retrieved = db.query(ArgoFloat).filter(ArgoFloat.float_id == 999999).first()
            if retrieved:
                print(f"   ✅ Test float retrieved: {retrieved.wmo_id}")
                print(f"   📍 Location: {retrieved.last_latitude}, {retrieved.last_longitude}")
            else:
                print("   ❌ Failed to retrieve test float")
                return False
        
        return True
        
    except Exception as e:
        print(f"   ❌ Data storage test failed: {e}")
        return False


def test_geographic_queries():
    """Test geographic queries and Indian Ocean bounds."""
    print("\n🗺️  Testing geographic queries...")
    
    try:
        from src.config import get_indian_ocean_bounds
        from src.data.database import get_db_session
        from src.data.models import ArgoFloat
        
        # Test bounds
        bounds = get_indian_ocean_bounds()
        print(f"   🌊 Indian Ocean bounds: {bounds}")
        
        # Test geographic query
        with get_db_session() as db:
            lon_min, lon_max, lat_min, lat_max = bounds
            
            indian_ocean_floats = db.query(ArgoFloat).filter(
                ArgoFloat.last_latitude >= lat_min,
                ArgoFloat.last_latitude <= lat_max,
                ArgoFloat.last_longitude >= lon_min,
                ArgoFloat.last_longitude <= lon_max
            ).all()
            
            print(f"   📊 Floats in Indian Ocean: {len(indian_ocean_floats)}")
            
            for float in indian_ocean_floats[:3]:  # Show first 3
                print(f"      • Float {float.float_id}: {float.last_latitude:.2f}, {float.last_longitude:.2f}")
        
        print("   ✅ Geographic queries working")
        return True
        
    except Exception as e:
        print(f"   ❌ Geographic queries failed: {e}")
        return False


def main():
    """Run all tests."""
    print("🧪 Testing Argo Platform Database & Ingestion")
    print("=" * 50)
    
    tests = [
        test_database_setup,
        test_argo_data_fetching,
        test_data_storage,
        test_geographic_queries
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Ready for next phase.")
        print("\nNext steps:")
        print("1. RAG system with vector embeddings")
        print("2. Gemini LLM integration")
        print("3. Streamlit dashboard")
    else:
        print("⚠️  Some tests failed. Please check the logs above.")
    
    return passed == len(tests)


if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n👋 Testing cancelled.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Testing failed with error: {e}")
        sys.exit(1)
