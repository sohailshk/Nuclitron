#!/usr/bin/env python3
"""
Simple database test for ARGO platform using SQLite.
This tests that our database models work correctly.
"""

import sys
import os
import logging
from pathlib import Path
from datetime import datetime

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
sys.path.insert(0, str(src_path))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_initialization():
    """Test database initialization with SQLite."""
    print("🗄️  Testing SQLite database setup...")
    
    try:
        # Import our database components
        from src.data.database import init_database, get_db_session
        from src.data.models import ArgoFloat, ArgoProfile, ArgoMeasurement, DataSummary
        
        # Initialize database
        print("   📦 Initializing database...")
        init_database()
        print("   ✅ Database initialized successfully")
        
        # Test basic operations
        print("   🔍 Testing basic database operations...")
        with get_db_session() as db:
            # Count existing records
            float_count = db.query(ArgoFloat).count()
            profile_count = db.query(ArgoProfile).count()
            measurement_count = db.query(ArgoMeasurement).count()
            summary_count = db.query(DataSummary).count()
            
            print(f"   📊 Current data:")
            print(f"      • Floats: {float_count}")
            print(f"      • Profiles: {profile_count}")
            print(f"      • Measurements: {measurement_count}")
            print(f"      • Summaries: {summary_count}")
        
        # Test creating a sample record
        print("   💾 Testing data insertion...")
        with get_db_session() as db:
            # Check if test data already exists
            existing_test_float = db.query(ArgoFloat).filter_by(float_id=999999).first()
            if existing_test_float:
                print(f"   ✅ Test data already exists: {existing_test_float.wmo_id}")
                print("   🧹 Cleaning up existing test data...")
                db.delete(existing_test_float)
                db.commit()
            
            # Create a test float
            test_float = ArgoFloat(
                float_id=999999,
                wmo_id="TEST999999",
                deployment_latitude=15.0,
                deployment_longitude=68.0,
                last_latitude=15.1,
                last_longitude=68.1,
                status='active',
                float_type='TEST',
                manufacturer='TEST_MFG'
            )
            
            # Add and commit
            db.add(test_float)
            db.commit()
            
            # Verify insertion
            retrieved_float = db.query(ArgoFloat).filter_by(float_id=999999).first()
            if retrieved_float:
                print(f"   ✅ Test float created: {retrieved_float.wmo_id}")
                
                # Clean up test data
                db.delete(retrieved_float)
                db.commit()
                print("   🧹 Test data cleaned up")
            else:
                print("   ❌ Failed to create test float")
                return False
        
        print("   ✅ Database test completed successfully!")
        return True
        
    except Exception as e:
        print(f"   ❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_configuration():
    """Test configuration loading."""
    print("\n⚙️  Testing configuration...")
    
    try:
        from src.config import get_settings
        
        settings = get_settings()
        print(f"   ✅ App name: {settings.app_name}")
        print(f"   ✅ Version: {settings.app_version}")
        print(f"   ✅ Database URL: {settings.database_url}")
        print(f"   ✅ Indian Ocean bounds: {settings.indian_ocean_bounds}")
        
        # Check API key (masked for security)
        if settings.gemini_api_key:
            masked_key = settings.gemini_api_key[:8] + "..." + settings.gemini_api_key[-4:]
            print(f"   ✅ Gemini API key: {masked_key}")
        else:
            print("   ⚠️  Gemini API key not configured")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Configuration test failed: {e}")
        return False

if __name__ == "__main__":
    print("🌊 Starting ARGO Platform Database Tests...\n")
    
    try:
        # Test configuration first
        config_ok = test_configuration()
        
        # Test database
        db_ok = test_database_initialization()
        
        print(f"\n📋 Test Results:")
        print(f"   Configuration: {'✅ PASS' if config_ok else '❌ FAIL'}")
        print(f"   Database: {'✅ PASS' if db_ok else '❌ FAIL'}")
        
        if config_ok and db_ok:
            print("\n🎉 All tests passed! Ready for next step.")
        else:
            print("\n❌ Some tests failed. Check errors above.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n👋 Tests cancelled.")
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        sys.exit(1)