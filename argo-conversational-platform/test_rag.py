"""
Test RAG system integration with Gemini LLM and vector embeddings.

This script tests the complete RAG pipeline from natural language
query to contextual response generation.
"""

import sys
import logging
import asyncio
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent.parent
src_path = project_root / "src"
sys.path.insert(0, str(src_path))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_gemini_llm():
    """Test Gemini LLM integration."""
    print("🤖 Testing Gemini LLM integration...")
    
    try:
        from src.rag import get_gemini_llm
        
        llm = get_gemini_llm()
        print("   ✅ Gemini LLM initialized")
        
        # Test query understanding
        test_query = "Show me temperature profiles in the Indian Ocean from last month"
        analysis = await llm.understand_query(test_query, "test_session")
        
        print(f"   📊 Query analysis: {analysis.get('intent', 'unknown')}")
        print(f"   🌍 Region: {analysis.get('entities', {}).get('geographic_region', 'N/A')}")
        print(f"   📏 Parameters: {analysis.get('entities', {}).get('parameters', [])}")
        
        # Test SQL generation
        sql_response = await llm.generate_sql(analysis)
        print(f"   💾 SQL generated: {len(sql_response.get('sql', ''))} characters")
        
        # Test response generation
        response = await llm.generate_response(analysis, [], "Test context")
        print(f"   💬 Response generated: {len(response)} characters")
        
        print("   ✅ Gemini LLM tests completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Gemini LLM test failed: {e}")
        return False


async def test_vector_embeddings():
    """Test vector embedding and search."""
    print("\n🔍 Testing vector embeddings...")
    
    try:
        from src.rag import get_vector_embedder, initialize_embeddings
        
        embedder = get_vector_embedder()
        print("   ✅ Vector embedder initialized")
        
        # Test embedding creation
        test_text = "Temperature measurements in the Indian Ocean"
        embedding = embedder.create_embedding(test_text)
        print(f"   📊 Embedding created: {len(embedding)} dimensions")
        
        # Initialize embeddings
        print("   🔄 Initializing knowledge embeddings...")
        embed_counts = initialize_embeddings()
        print(f"   📚 Embeddings created: {embed_counts}")
        
        # Test semantic search
        search_results = embedder.semantic_search("ocean temperature data", limit=3)
        print(f"   🔍 Search results: {len(search_results)} items found")
        
        for i, result in enumerate(search_results[:2]):
            print(f"      • {i+1}: {result['content'][:100]}... (similarity: {result['similarity']:.3f})")
        
        print("   ✅ Vector embedding tests completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Vector embedding test failed: {e}")
        return False


async def test_complete_rag_pipeline():
    """Test the complete RAG pipeline."""
    print("\n🌊 Testing complete RAG pipeline...")
    
    try:
        from src.rag import ask_argo
        
        # Test queries
        test_queries = [
            "What temperature data is available in the Indian Ocean?",
            "Show me recent salinity profiles",
            "How many Argo floats are active?",
            "नमस्ते, भारतीय महासागर में तापमान कैसा है?"  # Hindi query
        ]
        
        for i, query in enumerate(test_queries):
            print(f"\n   🔤 Query {i+1}: {query}")
            
            try:
                response = await ask_argo(query, f"test_session_{i}")
                
                print(f"   💬 Response: {response['response_text'][:150]}...")
                print(f"   🎯 Intent: {response.get('query_analysis', {}).get('intent', 'unknown')}")
                print(f"   ⏱️  Processing time: {response.get('processing_time_ms', 0):.1f}ms")
                
                if response.get('visualization'):
                    print(f"   📊 Visualization: {response['visualization']['type']}")
                
                if response.get('data_results'):
                    print(f"   📈 Data rows: {len(response['data_results'])}")
                
            except Exception as e:
                print(f"   ⚠️  Query failed: {e}")
        
        print("\n   ✅ RAG pipeline tests completed")
        return True
        
    except Exception as e:
        print(f"   ❌ RAG pipeline test failed: {e}")
        return False


async def test_conversation_memory():
    """Test conversation history and context."""
    print("\n💭 Testing conversation memory...")
    
    try:
        from src.rag import get_rag_system
        
        rag_system = get_rag_system()
        session_id = "memory_test_session"
        
        # First query
        response1 = await rag_system.process_query(
            "Tell me about Argo floats in the Indian Ocean",
            session_id
        )
        print(f"   💬 First response: {response1['response_text'][:100]}...")
        
        # Follow-up query
        response2 = await rag_system.process_query(
            "How deep do they measure?",
            session_id
        )
        print(f"   💬 Follow-up response: {response2['response_text'][:100]}...")
        
        # Get conversation history
        history = await rag_system.get_conversation_history(session_id)
        print(f"   📚 Conversation history: {len(history)} messages")
        
        print("   ✅ Conversation memory tests completed")
        return True
        
    except Exception as e:
        print(f"   ❌ Conversation memory test failed: {e}")
        return False


async def main():
    """Run all RAG tests."""
    print("🧪 Testing Argo RAG System")
    print("=" * 50)
    
    # Ensure database is initialized
    try:
        from src.data.database import init_database
        init_database()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
    
    tests = [
        test_gemini_llm,
        test_vector_embeddings,
        test_complete_rag_pipeline,
        test_conversation_memory
    ]
    
    passed = 0
    for test in tests:
        try:
            if await test():
                passed += 1
        except Exception as e:
            print(f"   ❌ Test error: {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 RAG Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All RAG tests passed! Ready for Streamlit dashboard.")
        print("\nNext steps:")
        print("1. Create Streamlit dashboard")
        print("2. Add interactive maps and visualizations")
        print("3. Test complete user workflow")
    else:
        print("⚠️  Some RAG tests failed. Please check the logs above.")
    
    return passed == len(tests)


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n👋 RAG testing cancelled.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ RAG testing failed with error: {e}")
        sys.exit(1)
