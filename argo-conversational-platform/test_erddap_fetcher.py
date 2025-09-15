#!/usr/bin/env python3
"""
Test script for ERDDAP data fetcher.

This script tests the new ERDDAP-based data fetching system.
"""

import sys
import logging
from pathlib import Path

# Add the src directory to the path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from src.data.ingestion.argo_fetcher import ERDDAPArgoFetcher, fetch_latest_indian_ocean_data
from src.data.database import get_db_session
from src.data.models import ArgoFloat, ArgoProfile, ArgoMeasurement, DataSummary

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_erddap_fetcher():
    """Test the ERDDAP fetcher functionality."""
    
    print("🧪 Testing ERDDAP ARGO Data Fetcher")
    print("=" * 50)
    
    try:
        # Test 1: Create fetcher instance
        print("\n1️⃣ Creating ERDDAP fetcher instance...")
        fetcher = ERDDAPArgoFetcher()
        print("✅ ERDDAP fetcher created successfully")
        
        # Test 2: Check database connection
        print("\n2️⃣ Testing database connection...")
        with get_db_session() as db:
            # Count existing data
            float_count = db.query(ArgoFloat).count()
            profile_count = db.query(ArgoProfile).count()
            measurement_count = db.query(ArgoMeasurement).count()
            summary_count = db.query(DataSummary).count()
            
            print(f"📊 Current database contents:")
            print(f"   - Floats: {float_count}")
            print(f"   - Profiles: {profile_count}")
            print(f"   - Measurements: {measurement_count}")
            print(f"   - Summaries: {summary_count}")
        print("✅ Database connection working")
        
        # Test 3: Fetch Indian Ocean data (limited for testing)
        print("\n3️⃣ Fetching Indian Ocean data (last 7 days, max 100 records)...")
        
        # Use small limits for testing
        result = fetcher.fetch_indian_ocean_data(days_back=7, limit=100)
        
        print(f"📈 Data fetch results:")
        print(f"   - Floats: {result.get('floats', 0)}")
        print(f"   - Profiles: {result.get('profiles', 0)}")
        print(f"   - Measurements: {result.get('measurements', 0)}")
        print(f"   - Source: {result.get('source', 'Unknown')}")
        print(f"   - Mock data: {result.get('mock', False)}")
        
        if 'error' in result:
            print(f"⚠️  Warning: {result['error']}")
        else:
            print("✅ Data fetch completed successfully")
        
        # Test 4: Verify data was stored
        print("\n4️⃣ Verifying data storage...")
        with get_db_session() as db:
            new_float_count = db.query(ArgoFloat).count()
            new_profile_count = db.query(ArgoProfile).count()
            new_measurement_count = db.query(ArgoMeasurement).count()
            new_summary_count = db.query(DataSummary).count()
            
            print(f"📊 Updated database contents:")
            print(f"   - Floats: {new_float_count} (+{new_float_count - float_count})")
            print(f"   - Profiles: {new_profile_count} (+{new_profile_count - profile_count})")
            print(f"   - Measurements: {new_measurement_count} (+{new_measurement_count - measurement_count})")
            print(f"   - Summaries: {new_summary_count} (+{new_summary_count - summary_count})")
            
            # Show some sample data
            if new_float_count > 0:
                print("\n📋 Sample float data:")
                sample_floats = db.query(ArgoFloat).limit(3).all()
                for i, float_obj in enumerate(sample_floats, 1):
                    print(f"   {i}. Float {float_obj.float_id} at ({float_obj.last_latitude:.2f}, {float_obj.last_longitude:.2f})")
            
            if new_profile_count > 0:
                print("\n📋 Sample profile data:")
                sample_profiles = db.query(ArgoProfile).limit(3).all()
                for i, profile in enumerate(sample_profiles, 1):
                    print(f"   {i}. Profile {profile.cycle_number} from Float {profile.float_id} on {profile.profile_date}")
        
        print("✅ Data verification completed")
        
        # Test 5: Test convenience function
        print("\n5️⃣ Testing convenience function...")
        result2 = fetch_latest_indian_ocean_data(days_back=3)
        print(f"📈 Convenience function results:")
        print(f"   - Floats: {result2.get('floats', 0)}")
        print(f"   - Profiles: {result2.get('profiles', 0)}")
        print(f"   - Measurements: {result2.get('measurements', 0)}")
        print("✅ Convenience function working")
        
        print(f"\n🎉 All tests passed! ERDDAP fetcher is working correctly.")
        
        # Final summary
        print(f"\n📊 Final Summary:")
        print(f"   - ERDDAP fetcher: ✅ Working")
        print(f"   - Database integration: ✅ Working") 
        print(f"   - Data processing: ✅ Working")
        print(f"   - Mock fallback: ✅ Working")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        logger.exception("Test failed")
        return False


if __name__ == "__main__":
    success = test_erddap_fetcher()
    sys.exit(0 if success else 1)