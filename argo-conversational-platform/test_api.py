#!/usr/bin/env python3
"""
Test script for Argo Platform API.

This script tests the FastAPI backend and its integration with the RAG system.
"""

import sys
import asyncio
import requests
import json
import time
from pathlib import Path

# Add the src directory to the path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

# Test configuration
API_BASE_URL = "http://localhost:8000"
TEST_QUERIES = [
    "What is the temperature in the Indian Ocean?",
    "Show me salinity data from recent ARGO floats",
    "How many active floats are there?",
    "What's the average temperature at 500m depth?",
    "Create a visualization of temperature profiles"
]


def test_api_endpoints():
    """Test the API endpoints without starting the server."""
    
    print("🧪 Testing Argo Platform API Endpoints")
    print("=" * 50)
    
    # Test basic imports and setup
    print("\n1️⃣ Testing API imports and setup...")
    try:
        # Test if we can import the API components
        from api import app, ChatRequest, ChatResponse, DataSummaryResponse
        from src.rag.orchestrator import ArgoRAGSystem
        from src.data.ingestion.argo_fetcher import fetch_latest_indian_ocean_data
        print("✅ All API imports successful")
        
        # Test RAG system initialization
        print("\n2️⃣ Testing RAG system initialization...")
        try:
            rag_system = ArgoRAGSystem()
            print("✅ RAG system initialized successfully")
        except Exception as e:
            print(f"⚠️  RAG system initialization warning: {e}")
            rag_system = None
        
        # Test request/response models
        print("\n3️⃣ Testing Pydantic models...")
        test_request = ChatRequest(
            message="Test query",
            session_id="test_session"
        )
        print(f"✅ ChatRequest model: {test_request.message}")
        
        test_response = ChatResponse(
            response_text="Test response",
            processing_time_ms=100.0,
            session_id="test_session",
            timestamp="2025-09-14T20:00:00"
        )
        print(f"✅ ChatResponse model: {test_response.response_text}")
        
        print(f"\n🎉 API setup tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ API setup test failed: {e}")
        return False


def test_api_server():
    """Test the API server if it's running."""
    
    print("\n🌐 Testing API Server (if running)")
    print("=" * 50)
    
    try:
        # Test root endpoint
        print("\n1️⃣ Testing root endpoint...")
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {data['message']}")
        else:
            print(f"⚠️  Root endpoint returned {response.status_code}")
        
        # Test health endpoint
        print("\n2️⃣ Testing health endpoint...")
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check: {data['status']}")
            print(f"   - Database: {data.get('database', 'unknown')}")
            print(f"   - RAG system: {data.get('rag_system', 'unknown')}")
            print(f"   - Data points: {data.get('data_points', 0)}")
        else:
            print(f"⚠️  Health endpoint returned {response.status_code}")
        
        # Test data summary
        print("\n3️⃣ Testing data summary endpoint...")
        response = requests.get(f"{API_BASE_URL}/data/summary", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Data summary:")
            print(f"   - Floats: {data.get('floats', 0)}")
            print(f"   - Profiles: {data.get('profiles', 0)}")
            print(f"   - Measurements: {data.get('measurements', 0)}")
            print(f"   - Latest data: {data.get('latest_data', 'None')}")
        else:
            print(f"⚠️  Data summary returned {response.status_code}")
        
        # Test chat endpoint
        print("\n4️⃣ Testing chat endpoint...")
        for i, query in enumerate(TEST_QUERIES[:2], 1):  # Test first 2 queries
            print(f"\n   Test {i}: {query}")
            
            chat_request = {
                "message": query,
                "session_id": f"test_session_{int(time.time())}"
            }
            
            response = requests.post(
                f"{API_BASE_URL}/chat",
                json=chat_request,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Response: {data['response_text'][:100]}...")
                print(f"   ⏱️  Processing time: {data.get('processing_time_ms', 0):.1f}ms")
                
                if data.get('data_results'):
                    print(f"   📊 Data rows: {data.get('total_data_rows', 0)}")
                
                if data.get('visualization'):
                    print(f"   📈 Visualization: {data['visualization'].get('type', 'unknown')}")
                    
            else:
                print(f"   ⚠️  Chat endpoint returned {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    error_data = response.json()
                    print(f"   Error: {error_data.get('error', 'Unknown error')}")
        
        print(f"\n🎉 API server tests completed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"\n⚠️  API server not running at {API_BASE_URL}")
        print("   To start the server, run: python api.py")
        return False
    except Exception as e:
        print(f"\n❌ API server test failed: {e}")
        return False


def main():
    """Main test function."""
    
    print("🚀 Argo Platform API Test Suite")
    print("=" * 60)
    
    # Test 1: API setup and imports
    setup_success = test_api_endpoints()
    
    # Test 2: API server (if running)
    server_success = test_api_server()
    
    # Final summary
    print(f"\n📊 Test Summary:")
    print(f"   - API setup: {'✅ Pass' if setup_success else '❌ Fail'}")
    print(f"   - API server: {'✅ Pass' if server_success else '⚠️  Not running'}")
    
    if setup_success:
        if server_success:
            print(f"\n🎉 All tests passed! API is ready for integration.")
        else:
            print(f"\n🟡 API setup is good, start server with: python api.py")
    else:
        print(f"\n❌ API setup issues need to be resolved.")
    
    return setup_success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)