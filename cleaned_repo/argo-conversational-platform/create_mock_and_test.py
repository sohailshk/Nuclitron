#!/usr/bin/env python3
"""
Create Mock Data and Test RAG System

This script creates proper mock data and tests the corrected RAG system.

Author: Argo Platform Team
Created: 2025-09-03
"""

import logging
from datetime import datetime, timedelta

from src.data.database import init_database, get_db_session
from src.data.ingestion.argo_fetcher import ArgoDataFetcher
from src.rag.embeddings import initialize_embeddings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_mock_data_and_test():
    """Create proper mock data and test RAG system."""
    print("🚀 Creating Mock Data and Testing RAG System")
    print("=" * 50)
    
    # Initialize database
    print("📊 Initializing database...")
    init_database()
    
    # Initialize fetcher and force create mock data
    print("🔄 Creating comprehensive mock data...")
    fetcher = ArgoDataFetcher()
    
    # Force create mock data by calling the private method directly
    try:
        result = fetcher._create_mock_indian_ocean_data(days_back=30)
        print(f"✅ Mock data created!")
        print(f"   📈 Profiles: {result.get('profiles', 0)}")
        print(f"   🤖 Floats: {result.get('floats', 0)}")
        print(f"   📊 Measurements: {result.get('measurements', 0)}")
        
    except Exception as e:
        print(f"❌ Error creating mock data: {e}")
        return False
    
    # Verify data was created
    print("\n🔍 Verifying mock data...")
    with get_db_session() as session:
        from src.data.models import ArgoFloat, ArgoProfile, ArgoMeasurement
        
        float_count = session.query(ArgoFloat).count()
        profile_count = session.query(ArgoProfile).count()
        measurement_count = session.query(ArgoMeasurement).count()
        
        print(f"📊 Database Contents:")
        print(f"   🤖 Argo Floats: {float_count}")
        print(f"   📈 Profiles: {profile_count}")
        print(f"   📏 Measurements: {measurement_count}")
        
        if profile_count == 0:
            print("❌ No profiles created - something went wrong")
            return False
        
        # Show sample data
        sample_profile = session.query(ArgoProfile).first()
        print(f"\n📍 Sample Profile:")
        print(f"   Location: {sample_profile.latitude:.2f}°N, {sample_profile.longitude:.2f}°E")
        print(f"   Date: {sample_profile.profile_date}")
        print(f"   Float ID: {sample_profile.float_id}")
        
        # Show sample measurements
        sample_measurements = session.query(ArgoMeasurement).filter(
            ArgoMeasurement.profile_id == sample_profile.id
        ).limit(3).all()
        
        print(f"\n📏 Sample Measurements (first 3):")
        for i, m in enumerate(sample_measurements):
            print(f"   {i+1}. Depth: {m.depth:.1f}m, Temp: {m.temperature:.2f}°C, Sal: {m.salinity:.2f} PSU")
    
    # Generate embeddings
    print("\n🧠 Generating embeddings...")
    try:
        result = initialize_embeddings()
        print(f"✅ Embeddings created: {result}")
    except Exception as e:
        print(f"❌ Error creating embeddings: {e}")
        return False
    
    # Test RAG system with corrected Gemini model
    print("\n🤖 Testing RAG system with corrected Gemini model...")
    try:
        import asyncio
        from src.rag.orchestrator import ArgoRAGSystem
        
        async def test_rag():
            rag = ArgoRAGSystem()
            
            # Test query
            test_query = "What temperature data is available in the Indian Ocean?"
            print(f"🔤 Test Query: {test_query}")
            
            response = await rag.process_query(test_query, session_id="test_session")
            
            print(f"💬 Response: {response['response_text'][:200]}...")
            print(f"🎯 Intent: {response.get('query_analysis', {}).get('intent', 'unknown')}")
            print(f"⏱️  Processing time: {response.get('processing_time_ms', 0)}ms")
            
            if response.get('data_results'):
                print(f"📊 SQL returned {len(response['data_results'])} rows")
            else:
                print("📊 No SQL results returned")
            
            return True
        
        # Run async test
        success = asyncio.run(test_rag())
        return success
        
    except Exception as e:
        print(f"❌ RAG system test failed: {e}")
        logger.exception("RAG test error")
        return False


if __name__ == "__main__":
    success = create_mock_data_and_test()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Mock data creation and RAG test completed successfully!")
        print("✅ Your platform now has working mock data and corrected LLM integration!")
        print("\n🎯 Next steps:")
        print("1. Create Streamlit dashboard")
        print("2. Add interactive maps and visualizations")
        print("3. Deploy to production")
    else:
        print("❌ Something went wrong - check the logs above")
        print("🔧 Debug the issues before proceeding")
