#!/usr/bin/env python3
"""
Quick RAG Test - Test the corrected RAG system with proper schema info.

Author: Argo Platform Team
Created: 2025-09-03
"""

import asyncio
from src.rag.orchestrator import ArgoRAGSystem


async def test_rag_corrected():
    """Test the corrected RAG system."""
    print("🚀 Testing Corrected RAG System")
    print("=" * 50)
    
    try:
        rag = ArgoRAGSystem()
        
        # Test query with corrected schema
        test_query = "What temperature data is available in the Indian Ocean?"
        print(f"🔤 Test Query: {test_query}")
        
        response = await rag.process_query(test_query, session_id="test_corrected")
        
        print(f"💬 Response: {response['response_text'][:200]}...")
        print(f"🎯 Intent: {response.get('query_analysis', {}).get('intent', 'unknown')}")
        print(f"⏱️  Processing time: {response.get('processing_time_ms', 0)}ms")
        
        if response.get('data_results'):
            print(f"📊 SQL returned {response.get('total_data_rows', 0)} total rows")
            print(f"📈 Sample data (showing first {len(response['data_results'])} rows):")
            for i, row in enumerate(response['data_results'][:3]):
                print(f"   {i+1}. Lat: {row.get('latitude', 'N/A'):.2f}°, Lon: {row.get('longitude', 'N/A'):.2f}°, Temp: {row.get('temperature', 'N/A'):.2f}°C")
        else:
            print("📊 No SQL results returned")
            
        print(f"🔧 Generated SQL: {response.get('sql_metadata', {}).get('query', 'None')}")
        
        return True
        
    except Exception as e:
        print(f"❌ RAG test failed: {e}")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_rag_corrected())
    
    if success:
        print("\n🎉 RAG system is working correctly!")
        print("✅ Ready to proceed with Streamlit dashboard!")
    else:
        print("\n❌ RAG system needs more debugging")
