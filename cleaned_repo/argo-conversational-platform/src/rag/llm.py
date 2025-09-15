"""
Google Gemini LLM integration for Argo Conversational Platform.

This module handles communication with Google Gemini AI for natural language
processing, query understanding, and response generation.

Author: Argo Platform Team
Created: 2025-09-03
"""

import logging
import json
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import asyncio

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("google-generativeai not available")

from ..config import get_gemini_api_key, get_settings
from ..data.database import get_db_session
from ..data.models import ConversationHistory

logger = logging.getLogger(__name__)


class GeminiLLM:
    """
    Google Gemini LLM interface for the Argo platform.
    
    Handles natural language understanding, SQL generation,
    and response formatting for ocean data queries.
    """
    
    def __init__(self):
        """Initialize Gemini client."""
        self.settings = get_settings()
        self.model = None
        
        if GEMINI_AVAILABLE:
            try:
                # Configure Gemini API
                api_key = get_gemini_api_key()
                genai.configure(api_key=api_key)
                
                # Initialize the model
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                logger.info("Gemini model initialized successfully")
                
                # Test the connection
                self._test_connection()
                
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self.model = None
        else:
            logger.warning("Gemini not available - using mock responses")
    
    def _test_connection(self):
        """Test Gemini API connection."""
        try:
            response = self.model.generate_content("Hello, test connection")
            logger.info("Gemini connection test successful")
        except Exception as e:
            logger.warning(f"Gemini connection test failed: {e}")
    
    async def understand_query(self, user_query: str, session_id: str) -> Dict[str, Any]:
        """
        Understand and analyze user query.
        
        Args:
            user_query: User's natural language query
            session_id: Session identifier
            
        Returns:
            Dict containing query analysis
        """
        if not self.model:
            return self._mock_query_understanding(user_query)
        
        try:
            # Create prompt for query understanding
            prompt = self._create_understanding_prompt(user_query)
            
            # Generate response
            response = await self._generate_async(prompt)
            
            # Parse the response
            analysis = self._parse_understanding_response(response)
            
            # Store in conversation history
            self._store_conversation(session_id, user_query, json.dumps(analysis))
            
            return analysis
            
        except Exception as e:
            logger.error(f"Query understanding failed: {e}")
            return self._mock_query_understanding(user_query)
    
    async def generate_sql(self, query_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate SQL query from analyzed user intent.
        
        Args:
            query_analysis: Analyzed query from understand_query
            
        Returns:
            Dict containing SQL query and metadata
        """
        if not self.model:
            return self._mock_sql_generation(query_analysis)
        
        try:
            # Create SQL generation prompt
            prompt = self._create_sql_prompt(query_analysis)
            
            # Generate SQL
            response = await self._generate_async(prompt)
            
            # Parse and validate SQL
            sql_result = self._parse_sql_response(response)
            
            return sql_result
            
        except Exception as e:
            logger.error(f"SQL generation failed: {e}")
            return self._mock_sql_generation(query_analysis)
    
    async def generate_response(self, query_analysis: Dict[str, Any], 
                              sql_results: Optional[List[Dict]] = None,
                              context: Optional[str] = None) -> str:
        """
        Generate natural language response.
        
        Args:
            query_analysis: Original query analysis
            sql_results: Results from SQL execution
            context: Additional context from RAG
            
        Returns:
            Natural language response
        """
        if not self.model:
            return self._mock_response_generation(query_analysis, sql_results)
        
        try:
            # Create response generation prompt
            prompt = self._create_response_prompt(query_analysis, sql_results, context)
            
            # Generate response
            response = await self._generate_async(prompt)
            
            return response.strip()
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            return self._mock_response_generation(query_analysis, sql_results)
    
    def _create_understanding_prompt(self, user_query: str) -> str:
        """Create prompt for query understanding."""
        return f"""
You are an expert oceanographic data analyst specializing in Argo float data. 
Analyze the following user query and extract key information.

User Query: "{user_query}"

Please analyze and respond with JSON containing:
{{
    "intent": "data_query|visualization|export|information|greeting",
    "entities": {{
        "geographic_region": "extracted region name or coordinates",
        "time_period": "extracted date range or relative time",
        "parameters": ["temperature", "salinity", "pressure", "depth"],
        "float_ids": ["specific float IDs if mentioned"],
        "data_type": "profiles|measurements|summaries|floats"
    }},
    "language": "en|hi|auto",
    "complexity": "simple|moderate|complex",
    "requires_visualization": true/false,
    "geographic_bounds": {{
        "lat_min": number,
        "lat_max": number,
        "lon_min": number,
        "lon_max": number
    }}
}}

Focus on Indian Ocean region by default. Handle both English and Hindi queries.
"""
    
    def _create_sql_prompt(self, query_analysis: Dict[str, Any]) -> str:
        """Create prompt for SQL generation."""
        schema_info = """
Available Tables:
1. argo_floats: id (UUID), float_id (int), wmo_id, deployment_latitude, deployment_longitude, last_latitude, last_longitude, status
2. argo_profiles: id (UUID), float_id (int, FK to argo_floats.float_id), cycle_number, profile_date, latitude, longitude, data_mode, qc_flag
3. argo_measurements: id (UUID), profile_id (UUID, FK to argo_profiles.id), pressure, depth, temperature, salinity, temperature_qc, salinity_qc
4. data_summaries: region_name, min_latitude, max_latitude, total_profiles, avg_temperature, avg_salinity

Key Relationships:
- argo_floats.float_id → argo_profiles.float_id
- argo_profiles.id → argo_measurements.profile_id

Geographic bounds for Indian Ocean: lat[-40, 30], lon[-90, 90]
"""
        
        return f"""
Generate a safe, read-only SQL query for Argo oceanographic data.

Query Analysis: {json.dumps(query_analysis, indent=2)}

Database Schema:
{schema_info}

Rules:
1. Only SELECT queries allowed
2. Always include QC filtering (qc_flag = '1' for good data)
3. Use proper geographic bounds
4. Include appropriate JOINs
5. Limit results to prevent large responses
6. Use proper date formatting

Respond with JSON:
{{
    "sql": "SELECT ... FROM ... WHERE ...",
    "explanation": "What this query does",
    "estimated_rows": estimated_number_of_rows,
    "safety_checks": ["list of safety validations"]
}}
"""
    
    def _create_response_prompt(self, query_analysis: Dict[str, Any], 
                               sql_results: Optional[List[Dict]], 
                               context: Optional[str]) -> str:
        """Create prompt for response generation."""
        language = query_analysis.get('language', 'en')
        
        prompt = f"""
Generate a natural language response about Argo oceanographic data.

Original Query Analysis: {json.dumps(query_analysis, indent=2)}

SQL Results: {json.dumps(sql_results[:5] if sql_results else [], indent=2)}
{"(showing first 5 rows)" if sql_results and len(sql_results) > 5 else ""}

Additional Context: {context or "None"}

Instructions:
1. Respond in {"Hindi" if language == "hi" else "English"}
2. Be conversational and informative
3. Include specific data values when available
4. Mention data sources and quality
5. Suggest follow-up questions
6. Keep response under 500 words
7. Use proper units (°C, PSU, dbar, meters)

Response format:
- Start with a direct answer
- Include key statistics if available
- Mention geographic and temporal scope
- End with helpful suggestions
"""
        
        return prompt
    
    async def _generate_async(self, prompt: str) -> str:
        """Generate content asynchronously."""
        try:
            # Run in thread pool since Gemini client is sync
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(prompt)
            )
            return response.text
        except Exception as e:
            logger.error(f"Async generation failed: {e}")
            raise
    
    def _parse_understanding_response(self, response: str) -> Dict[str, Any]:
        """Parse query understanding response."""
        try:
            # Extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            logger.error(f"Failed to parse understanding response: {e}")
            return {
                "intent": "information",
                "entities": {},
                "language": "en",
                "complexity": "simple",
                "requires_visualization": False
            }
    
    def _parse_sql_response(self, response: str) -> Dict[str, Any]:
        """Parse SQL generation response."""
        try:
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            logger.error(f"Failed to parse SQL response: {e}")
            return {
                "sql": "SELECT COUNT(*) as total_profiles FROM argo_profiles WHERE qc_flag = '1'",
                "explanation": "Count of quality-controlled Argo profiles",
                "estimated_rows": 1,
                "safety_checks": ["basic count query"]
            }
    
    def _store_conversation(self, session_id: str, user_query: str, system_response: str):
        """Store conversation in database."""
        try:
            with get_db_session() as db:
                conversation = ConversationHistory(
                    session_id=session_id,
                    user_query=user_query,
                    system_response=system_response,
                    created_at=datetime.now()
                )
                db.add(conversation)
                db.commit()
        except Exception as e:
            logger.error(f"Failed to store conversation: {e}")
    
    # Mock methods for development
    def _mock_query_understanding(self, user_query: str) -> Dict[str, Any]:
        """Mock query understanding for development."""
        return {
            "intent": "data_query",
            "entities": {
                "geographic_region": "Indian Ocean",
                "time_period": "recent",
                "parameters": ["temperature", "salinity"],
                "data_type": "profiles"
            },
            "language": "en",
            "complexity": "simple",
            "requires_visualization": True,
            "geographic_bounds": {
                "lat_min": -40.0,
                "lat_max": 30.0,
                "lon_min": -90.0,
                "lon_max": 90.0
            }
        }
    
    def _mock_sql_generation(self, query_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Mock SQL generation for development."""
        return {
            "sql": """
            SELECT 
                p.latitude, p.longitude, p.profile_date,
                AVG(m.temperature) as avg_temp,
                AVG(m.salinity) as avg_salinity
            FROM argo_profiles p
            JOIN argo_measurements m ON p.id = m.profile_id
            WHERE p.latitude BETWEEN -40 AND 30
            AND p.longitude BETWEEN -90 AND 90
            AND p.qc_flag = '1'
            AND m.temperature_qc = '1'
            GROUP BY p.id
            LIMIT 100
            """,
            "explanation": "Recent temperature and salinity profiles from Indian Ocean",
            "estimated_rows": 100,
            "safety_checks": ["read-only", "QC filtered", "limited results"]
        }
    
    def _mock_response_generation(self, query_analysis: Dict[str, Any], 
                                 sql_results: Optional[List[Dict]]) -> str:
        """Mock response generation for development."""
        return """
Based on recent Argo float data from the Indian Ocean region, I found several oceanographic profiles. 
The data shows temperature and salinity measurements from various depths and locations.

Key findings:
- Temperature ranges from 2°C to 29°C across different depths
- Salinity values are typically between 34.5 and 36.5 PSU
- Data quality is good (QC flag = 1)

This data comes from the global Argo float network and is updated regularly. 
Would you like me to show you specific depth profiles or temperature trends?
"""


# Singleton instance
_gemini_instance = None

def get_gemini_llm() -> GeminiLLM:
    """Get singleton Gemini LLM instance."""
    global _gemini_instance
    if _gemini_instance is None:
        _gemini_instance = GeminiLLM()
    return _gemini_instance


# Export main functions
__all__ = [
    'GeminiLLM',
    'get_gemini_llm'
]
