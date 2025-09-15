#!/usr/bin/env python3
"""
Test SQL execution pipeline - validate LLM-gene                print(f"🎉 Test Result: {'✅ PASS' if is_successful else '❌ FAIL'}")
                print(f"💬 Full Response: {response_text}")
                print("-" * 60)
                
                return {d SQL queries
"""

import requests
import json
import time
from typing import Dict, Any

class SQLPipelineTest:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id = f"sql_test_{int(time.time())}"
        
    def test_query(self, query: str, expected_elements: list = None) -> Dict[str, Any]:
        """Test a chat query and validate SQL execution"""
        print(f"\n🔍 Testing: {query}")
        print("=" * 60)
        
        try:
            response = requests.post(
                f"{self.base_url}/chat",
                json={
                    "message": query,
                    "session_id": self.session_id
                },
                timeout=120  # Increased timeout for complex queries
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ Status: {response.status_code}")
                print(f"📊 Response time: {result.get('response_time_ms', 0):.1f}ms")
                print(f"🎯 Intent: {result.get('intent', 'unknown')}")
                
                # More comprehensive validation
                response_text = result.get('response_text', '')
                sql_query = result.get('sql_query', '')  # Check if there's SQL in query_analysis
                data_count = result.get('total_data_rows', 0)
                
                # Check query_analysis for SQL
                query_analysis = result.get('query_analysis', {})
                if not sql_query and 'sql' in query_analysis:
                    sql_query = query_analysis.get('sql', '')
                
                # Check data_results for actual data
                data_results = result.get('data_results', [])
                if data_results:
                    data_count = len(data_results)
                
                # Extract SQL from response if not in separate field
                if not sql_query and 'SELECT' in response_text.upper():
                    sql_start = response_text.upper().find('SELECT')
                    sql_end = response_text.find(';', sql_start)
                    if sql_end == -1:
                        sql_end = len(response_text)
                    sql_query = response_text[sql_start:sql_end+1].strip()
                
                # Check for expected elements in response and SQL
                full_text = f"{response_text} {sql_query}".lower()
                expected_lower = [elem.lower() for elem in expected_elements] if expected_elements else []
                found_elements = [elem for elem in expected_lower if elem in full_text]
                missing_elements = [elem for elem in expected_lower if elem not in full_text]
                
                # Validation checks
                has_sql = bool(sql_query and 'SELECT' in sql_query.upper())
                has_data = data_count > 0
                has_expected = len(found_elements) >= len(expected_elements) // 2 if expected_elements else True
                
                print(f"🔍 SQL Generated: {'✅' if has_sql else '❌'}")
                print(f"📊 Data Retrieved: {'✅' if has_data else '❌'} ({data_count} rows)")
                print(f"🎯 Elements Found: {'✅' if has_expected else '⚠️'} ({len(found_elements)}/{len(expected_elements) if expected_elements else 0})")
                
                if has_sql:
                    print(f"📝 SQL: {sql_query[:100]}...")
                
                if found_elements:
                    print(f"✅ Found expected elements: {found_elements}")
                if missing_elements:
                    print(f"⚠️  Missing elements: {missing_elements}")
                
                # Overall success criteria
                test_success = has_sql and (has_data or len(found_elements) > 0)
                
                print(f"🎉 Test Result: {'✅ PASS' if test_success else '❌ FAIL'}")
                print(f"💬 Full Response:")
                print(f"   Response Text: {response_text}")
                print(f"   SQL Query: {sql_query}")
                print(f"   Data Results: {str(data_results)[:500]}...")
                
                return {
                    "success": test_success,
                    "result": result,
                    "response_time": result.get('response_time_ms', 0),
                    "has_sql": has_sql,
                    "has_data": has_data,
                    "data_count": data_count
                }
                
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"📝 Response: {response.text}")
                return {"success": False, "error": response.text}
                
        except requests.exceptions.Timeout:
            print("⏰ Request timeout (120s)")
            return {"success": False, "error": "timeout"}
        except Exception as e:
            print(f"💥 Exception: {str(e)}")
            return {"success": False, "error": str(e)}

def main():
    print("🔬 SQL Pipeline Test Suite")
    print("=" * 60)
    
    # Test if API is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code != 200:
            print("❌ API not running. Start with: python api.py")
            return
    except:
        print("❌ API not accessible. Start with: python api.py")
        return
    
    tester = SQLPipelineTest()
    
    # Test cases with expected elements
    test_cases = [
        {
            "query": "What is the average temperature in the Indian Ocean?",
            "expected": ["temperature", "average", "Indian Ocean", "SELECT"]
        },
        {
            "query": "Show me salinity data from the last month",
            "expected": ["salinity", "SELECT", "WHERE"]
        },
        {
            "query": "Find floats near coordinates 10.5, 75.2",
            "expected": ["latitude", "longitude", "floats", "WHERE"]
        },
        {
            "query": "What is the deepest measurement we have?",
            "expected": ["depth", "pressure", "MAX", "SELECT"]
        },
        {
            "query": "Show temperature profiles for float 2902746",
            "expected": ["temperature", "float", "2902746", "SELECT"]
        },
        {
            "query": "Compare salinity between surface and deep water",
            "expected": ["salinity", "pressure", "depth", "WHERE"]
        }
    ]
    
    results = []
    total_time = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}/{len(test_cases)}")
        result = tester.test_query(
            test_case["query"], 
            test_case["expected"]
        )
        results.append(result)
        
        if result["success"]:
            total_time += result.get("response_time", 0)
        
        # Brief pause between tests
        time.sleep(2)
    
    # Summary
    print(f"\n📋 Test Summary")
    print("=" * 60)
    
    successful = sum(1 for r in results if r["success"])
    failed = len(results) - successful
    
    print(f"✅ Successful: {successful}/{len(results)}")
    print(f"❌ Failed: {failed}/{len(results)}")
    
    if successful > 0:
        avg_time = total_time / successful
        print(f"⏱️  Average response time: {avg_time:.1f}ms")
    
    if successful == len(results):
        print("\n🎉 All SQL pipeline tests passed!")
        print("✅ LLM-generated SQL execution is working correctly")
    else:
        print(f"\n⚠️  {failed} tests failed. Check the logs above.")

if __name__ == "__main__":
    main()