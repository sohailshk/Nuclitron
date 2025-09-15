"""
RAG (Retrieval-Augmented Generation) orchestrator for Argo platform.

This module coordinates the entire RAG pipeline: query understanding,
vector retrieval, SQL generation, execution, and response generation.

Author: Argo Platform Team
Created: 2025-09-03
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

from sqlalchemy import text
from ..config import get_settings
from ..data.database import get_db_session
from .llm import get_gemini_llm
from .embeddings import get_vector_embedder

logger = logging.getLogger(__name__)


class ArgoRAGSystem:
    """
    Complete RAG system for Argo oceanographic data queries.
    
    Orchestrates the full pipeline from natural language query
    to contextual response with data visualization support.
    """
    
    def __init__(self):
        """Initialize RAG system components."""
        self.settings = get_settings()
        self.llm = get_gemini_llm()
        self.embedder = get_vector_embedder()
        logger.info("Argo RAG system initialized")
    
    async def process_query(self, user_query: str, session_id: str = None) -> Dict[str, Any]:
        """
        Process a complete user query through the RAG pipeline.
        
        Args:
            user_query: User's natural language query
            session_id: Session identifier for conversation tracking
            
        Returns:
            Complete response with data, visualization specs, and metadata
        """
        if session_id is None:
            session_id = f"session_{datetime.now().isoformat()}"
        
        start_time = datetime.now()
        
        try:
            # Step 1: Understand the query
            logger.info(f"Processing query: {user_query[:100]}...")
            query_analysis = await self.llm.understand_query(user_query, session_id)
            
            # Step 2: Retrieve relevant context
            context = await self._retrieve_context(query_analysis)
            
            # Step 3: Generate and execute SQL if needed
            sql_results = None
            sql_metadata = None
            
            if query_analysis.get('intent') in ['data_query', 'visualization']:
                sql_response = await self.llm.generate_sql(query_analysis)
                sql_results, sql_metadata = await self._execute_sql_safely(sql_response)
            
            # Step 4: Generate natural language response
            response_text = await self.llm.generate_response(
                query_analysis, sql_results, context
            )
            
            # Step 5: Create visualization specification if needed
            viz_spec = None
            if query_analysis.get('requires_visualization') and sql_results:
                viz_spec = self._create_visualization_spec(query_analysis, sql_results)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Compile complete response
            complete_response = {
                'response_text': response_text,
                'query_analysis': query_analysis,
                'context_sources': len(context) if context else 0,
                'sql_metadata': sql_metadata,
                'data_results': sql_results[:10] if sql_results else None,  # Limit for response
                'total_data_rows': len(sql_results) if sql_results else 0,
                'visualization': viz_spec,
                'processing_time_ms': processing_time,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Query processed successfully in {processing_time:.1f}ms")
            return complete_response
            
        except Exception as e:
            logger.error(f"Query processing failed: {e}")
            return self._create_error_response(str(e), session_id)
    
    async def _retrieve_context(self, query_analysis: Dict[str, Any]) -> List[str]:
        """
        Retrieve relevant context using vector search.
        
        Args:
            query_analysis: Analyzed query from LLM
            
        Returns:
            List of relevant context strings
        """
        try:
            # Extract search terms from query analysis
            entities = query_analysis.get('entities', {})
            search_terms = []
            
            # Add geographic region
            if 'geographic_region' in entities:
                search_terms.append(entities['geographic_region'])
            
            # Add parameters
            if 'parameters' in entities:
                search_terms.extend(entities['parameters'])
            
            # Add data type
            if 'data_type' in entities:
                search_terms.append(entities['data_type'])
            
            # Combine search terms
            search_query = " ".join(search_terms) if search_terms else "oceanographic data"
            
            # Set up filters
            filters = {}
            if entities.get('geographic_region'):
                filters['region'] = entities['geographic_region'].lower().replace(' ', '_')
            
            # Perform semantic search
            search_results = self.embedder.semantic_search(
                search_query, 
                limit=5, 
                filters=filters
            )
            
            # Extract context text
            context = [result['content'] for result in search_results if result['similarity'] > 0.3]
            
            logger.info(f"Retrieved {len(context)} context items for: {search_query}")
            return context
            
        except Exception as e:
            logger.error(f"Context retrieval failed: {e}")
            return []
    
    async def _execute_sql_safely(self, sql_response: Dict[str, Any]) -> tuple[Optional[List[Dict]], Optional[Dict]]:
        """
        Execute SQL query with safety checks.
        
        Args:
            sql_response: SQL generation response from LLM
            
        Returns:
            Tuple of (results, metadata)
        """
        try:
            sql_query = sql_response.get('sql', '')
            
            # Safety validation
            if not self._validate_sql_safety(sql_query):
                logger.warning(f"SQL query failed safety validation: {sql_query}")
                return None, {'error': 'Query failed safety validation'}
            
            # Execute query
            with get_db_session() as db:
                result = db.execute(text(sql_query))
                
                # Convert to list of dictionaries
                columns = result.keys()
                rows = result.fetchall()
                
                data = []
                for row in rows:
                    data.append(dict(zip(columns, row)))
                
                metadata = {
                    'query': sql_query,
                    'explanation': sql_response.get('explanation'),
                    'rows_returned': len(data),
                    'safety_checks': sql_response.get('safety_checks', [])
                }
                
                logger.info(f"SQL executed successfully: {len(data)} rows returned")
                return data, metadata
                
        except Exception as e:
            logger.error(f"SQL execution failed: {e}")
            return None, {'error': str(e)}
    
    def _validate_sql_safety(self, sql_query: str) -> bool:
        """
        Validate SQL query for safety.
        
        Args:
            sql_query: SQL query to validate
            
        Returns:
            True if query is safe
        """
        sql_lower = sql_query.lower().strip()
        
        # Must be a SELECT query
        if not sql_lower.startswith('select'):
            return False
        
        # Forbidden operations
        forbidden_keywords = [
            'delete', 'update', 'insert', 'drop', 'create', 'alter',
            'truncate', 'exec', 'execute', 'grant', 'revoke'
        ]
        
        for keyword in forbidden_keywords:
            if keyword in sql_lower:
                return False
        
        # Must have reasonable limits
        if 'limit' not in sql_lower and 'top' not in sql_lower:
            # Add default limit if missing
            return False
        
        return True
    
    def _create_visualization_spec(self, query_analysis: Dict[str, Any], 
                                 sql_results: List[Dict]) -> Optional[Dict[str, Any]]:
        """
        Create visualization specification based on query and data.
        
        Args:
            query_analysis: Original query analysis
            sql_results: SQL query results
            
        Returns:
            Visualization specification for frontend
        """
        if not sql_results:
            return None
        
        try:
            # Analyze data structure
            sample_row = sql_results[0]
            columns = list(sample_row.keys())
            
            # Determine visualization type
            has_coordinates = any(col in columns for col in ['latitude', 'longitude', 'lat', 'lon'])
            has_temporal = any(col in columns for col in ['date', 'time', 'profile_date'])
            has_depth = any(col in columns for col in ['depth', 'pressure'])
            
            viz_spec = {
                'type': 'scatter',  # Default
                'data': sql_results[:100],  # Limit data size
                'columns': columns
            }
            
            # Geographic visualization
            if has_coordinates:
                viz_spec['type'] = 'map'
                viz_spec['lat_column'] = next((col for col in columns if 'lat' in col.lower()), None)
                viz_spec['lon_column'] = next((col for col in columns if 'lon' in col.lower()), None)
                
                # Color mapping
                numeric_cols = [col for col, val in sample_row.items() 
                              if isinstance(val, (int, float)) and 'lat' not in col.lower() and 'lon' not in col.lower()]
                if numeric_cols:
                    viz_spec['color_column'] = numeric_cols[0]
            
            # Profile/depth visualization
            elif has_depth:
                viz_spec['type'] = 'profile'
                viz_spec['depth_column'] = next((col for col in columns if 'depth' in col.lower() or 'pressure' in col.lower()), None)
                
                # Parameter columns
                param_cols = [col for col, val in sample_row.items() 
                            if isinstance(val, (int, float)) and col != viz_spec['depth_column']]
                viz_spec['parameter_columns'] = param_cols[:3]  # Limit to 3 parameters
            
            # Time series
            elif has_temporal:
                viz_spec['type'] = 'timeseries'
                viz_spec['time_column'] = next((col for col in columns if 'date' in col.lower() or 'time' in col.lower()), None)
                
                # Value columns
                value_cols = [col for col, val in sample_row.items() 
                            if isinstance(val, (int, float))]
                viz_spec['value_columns'] = value_cols[:2]  # Limit to 2 series
            
            # Add metadata
            viz_spec['title'] = self._generate_viz_title(query_analysis)
            viz_spec['data_count'] = len(sql_results)
            
            return viz_spec
            
        except Exception as e:
            logger.error(f"Visualization spec creation failed: {e}")
            return None
    
    def _generate_viz_title(self, query_analysis: Dict[str, Any]) -> str:
        """Generate title for visualization."""
        entities = query_analysis.get('entities', {})
        
        title_parts = []
        if entities.get('parameters'):
            title_parts.append(" & ".join(entities['parameters'][:2]))
        
        if entities.get('geographic_region'):
            title_parts.append(f"in {entities['geographic_region']}")
        
        if entities.get('time_period'):
            title_parts.append(f"({entities['time_period']})")
        
        return " ".join(title_parts) if title_parts else "Argo Data Visualization"
    
    def _create_error_response(self, error_message: str, session_id: str) -> Dict[str, Any]:
        """Create error response."""
        return {
            'response_text': f"I apologize, but I encountered an error processing your query: {error_message}. Please try rephrasing your question or ask for help with Argo data queries.",
            'error': error_message,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'processing_time_ms': 0
        }
    
    async def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get conversation history for a session.
        
        Args:
            session_id: Session identifier
            limit: Maximum number of messages
            
        Returns:
            List of conversation messages
        """
        try:
            from ..data.models import ConversationHistory
            
            with get_db_session() as db:
                conversations = db.query(ConversationHistory).filter(
                    ConversationHistory.session_id == session_id
                ).order_by(ConversationHistory.created_at.desc()).limit(limit).all()
                
                history = []
                for conv in reversed(conversations):  # Chronological order
                    history.append({
                        'user_query': conv.user_query,
                        'system_response': conv.system_response,
                        'timestamp': conv.created_at.isoformat(),
                        'intent': conv.intent
                    })
                
                return history
                
        except Exception as e:
            logger.error(f"Failed to get conversation history: {e}")
            return []


# Singleton instance
_rag_system = None

def get_rag_system() -> ArgoRAGSystem:
    """Get singleton RAG system instance."""
    global _rag_system
    if _rag_system is None:
        _rag_system = ArgoRAGSystem()
    return _rag_system


# Convenience function for direct queries
async def ask_argo(query: str, session_id: str = None) -> Dict[str, Any]:
    """
    Simple interface for asking questions about Argo data.
    
    Args:
        query: Natural language question
        session_id: Optional session identifier
        
    Returns:
        Complete response with data and visualizations
    """
    rag_system = get_rag_system()
    return await rag_system.process_query(query, session_id)


# Export main functions
__all__ = [
    'ArgoRAGSystem',
    'get_rag_system',
    'ask_argo'
]
