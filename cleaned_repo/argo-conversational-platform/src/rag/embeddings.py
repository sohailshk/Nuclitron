"""
Vector embeddings and semantic search for Argo data RAG.

This module handles creating embeddings of data summaries and metadata,
storing them in the database, and performing semantic retrieval for context.

Author: Argo Platform Team  
Created: 2025-09-03
"""

import logging
import json
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from datetime import datetime

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    logging.warning("sentence-transformers not available")

from ..config import get_settings
from ..data.database import get_db_session
from ..data.models import VectorEmbedding, DataSummary, ArgoFloat, ArgoProfile

logger = logging.getLogger(__name__)


class VectorEmbedder:
    """
    Vector embedding service for semantic search in Argo data.
    
    Creates embeddings of data summaries, metadata, and natural language
    descriptions for retrieval-augmented generation.
    """
    
    def __init__(self):
        """Initialize the embedding model."""
        self.settings = get_settings()
        self.model = None
        self.model_name = "all-MiniLM-L6-v2"  # Lightweight model for development
        
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                # Load sentence transformer model
                self.model = SentenceTransformer(self.model_name)
                logger.info(f"Initialized embedding model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                self.model = None
        else:
            logger.warning("Sentence transformers not available - using mock embeddings")
    
    def create_embedding(self, text: str) -> List[float]:
        """
        Create vector embedding for text.
        
        Args:
            text: Text to embed
            
        Returns:
            List of embedding values
        """
        if not self.model:
            return self._create_mock_embedding(text)
        
        try:
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Embedding creation failed: {e}")
            return self._create_mock_embedding(text)
    
    def create_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Create embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        if not self.model:
            return [self._create_mock_embedding(text) for text in texts]
        
        try:
            embeddings = self.model.encode(texts)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Batch embedding creation failed: {e}")
            return [self._create_mock_embedding(text) for text in texts]
    
    def semantic_search(self, query: str, limit: int = 5, 
                       filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Perform semantic search over stored embeddings.
        
        Args:
            query: Search query
            limit: Maximum number of results
            filters: Optional filters (content_type, region, etc.)
            
        Returns:
            List of matching documents with similarity scores
        """
        try:
            # Create embedding for query
            query_embedding = self.create_embedding(query)
            
            # Search stored embeddings
            with get_db_session() as db:
                # Build query with filters
                db_query = db.query(VectorEmbedding)
                
                if filters:
                    if 'content_type' in filters:
                        db_query = db_query.filter(VectorEmbedding.content_type == filters['content_type'])
                    if 'region' in filters:
                        db_query = db_query.filter(VectorEmbedding.region == filters['region'])
                    if 'language' in filters:
                        db_query = db_query.filter(VectorEmbedding.language == filters['language'])
                
                # Get all candidates
                candidates = db_query.all()
                
                # Calculate similarity scores
                results = []
                for candidate in candidates:
                    try:
                        stored_embedding = json.loads(candidate.embedding)
                        similarity = self._cosine_similarity(query_embedding, stored_embedding)
                        
                        results.append({
                            'id': candidate.id,
                            'content': candidate.text_content,
                            'content_type': candidate.content_type,
                            'region': candidate.region,
                            'similarity': similarity,
                            'metadata': {
                                'content_id': candidate.content_id,
                                'data_type': candidate.data_type,
                                'importance': candidate.importance
                            }
                        })
                    except Exception as e:
                        logger.error(f"Error processing candidate {candidate.id}: {e}")
                
                # Sort by similarity and return top results
                results.sort(key=lambda x: x['similarity'], reverse=True)
                return results[:limit]
                
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []
    
    def embed_data_summaries(self) -> int:
        """
        Create embeddings for existing data summaries.
        
        Returns:
            Number of embeddings created
        """
        count = 0
        
        try:
            with get_db_session() as db:
                # Get all data summaries without embeddings
                summaries = db.query(DataSummary).all()
                
                for summary in summaries:
                    # Check if embedding already exists
                    existing = db.query(VectorEmbedding).filter(
                        VectorEmbedding.content_type == 'summary',
                        VectorEmbedding.content_id == str(summary.id)
                    ).first()
                    
                    if existing:
                        continue  # Skip if already embedded
                    
                    # Create text description
                    text_content = self._create_summary_text(summary)
                    
                    # Create embedding
                    embedding = self.create_embedding(text_content)
                    
                    # Store in database
                    vector_embedding = VectorEmbedding(
                        content_type='summary',
                        content_id=str(summary.id),
                        text_content=text_content,
                        embedding_model=self.model_name,
                        embedding=json.dumps(embedding),
                        language='en',
                        region=summary.region_name,
                        data_type='summary',
                        importance=1.0
                    )
                    
                    db.add(vector_embedding)
                    count += 1
                
                db.commit()
                logger.info(f"Created {count} summary embeddings")
                
        except Exception as e:
            logger.error(f"Failed to embed data summaries: {e}")
        
        return count
    
    def embed_float_metadata(self, limit: int = 100) -> int:
        """
        Create embeddings for float metadata.
        
        Args:
            limit: Maximum number of floats to process
            
        Returns:
            Number of embeddings created
        """
        count = 0
        
        try:
            with get_db_session() as db:
                # Get floats without embeddings
                floats = db.query(ArgoFloat).limit(limit).all()
                
                for float_obj in floats:
                    # Check if embedding already exists
                    existing = db.query(VectorEmbedding).filter(
                        VectorEmbedding.content_type == 'float_metadata',
                        VectorEmbedding.content_id == str(float_obj.float_id)
                    ).first()
                    
                    if existing:
                        continue
                    
                    # Create text description
                    text_content = self._create_float_text(float_obj)
                    
                    # Create embedding
                    embedding = self.create_embedding(text_content)
                    
                    # Store in database
                    vector_embedding = VectorEmbedding(
                        content_type='float_metadata',
                        content_id=str(float_obj.float_id),
                        text_content=text_content,
                        embedding_model=self.model_name,
                        embedding=json.dumps(embedding),
                        language='en',
                        region=self._determine_region(float_obj.last_latitude, float_obj.last_longitude),
                        data_type='metadata',
                        importance=0.8
                    )
                    
                    db.add(vector_embedding)
                    count += 1
                
                db.commit()
                logger.info(f"Created {count} float metadata embeddings")
                
        except Exception as e:
            logger.error(f"Failed to embed float metadata: {e}")
        
        return count
    
    def create_knowledge_embeddings(self) -> int:
        """
        Create embeddings for oceanographic knowledge and FAQ.
        
        Returns:
            Number of embeddings created
        """
        knowledge_items = [
            {
                "content": "Argo floats are autonomous oceanographic instruments that drift with ocean currents and measure temperature, salinity, and pressure profiles from the surface to 2000 meters depth.",
                "type": "general_knowledge",
                "region": "global",
                "importance": 1.0
            },
            {
                "content": "Temperature in the ocean varies from about -2°C in polar regions to over 30°C in tropical surface waters. The Indian Ocean has warm surface temperatures typically between 25-30°C.",
                "type": "parameter_info",
                "region": "indian_ocean",
                "importance": 0.9
            },
            {
                "content": "Salinity is measured in Practical Salinity Units (PSU). Ocean salinity typically ranges from 30-37 PSU, with the Indian Ocean having values around 34.5-36.5 PSU.",
                "type": "parameter_info",
                "region": "indian_ocean",
                "importance": 0.9
            },
            {
                "content": "Pressure in oceanography is measured in decibars (dbar). 1 dbar approximately equals 1 meter of depth. Argo floats typically profile to 2000 dbar (about 2000 meters).",
                "type": "parameter_info",
                "region": "global",
                "importance": 0.8
            },
            {
                "content": "Quality control flags indicate data reliability: 1=good, 2=probably good, 3=probably bad, 4=bad, 5=value changed, 8=estimated, 9=missing data.",
                "type": "technical_info",
                "region": "global",
                "importance": 0.7
            },
            {
                "content": "The Indian Ocean covers approximately 70.6 million square kilometers and contains important water masses including Antarctic Intermediate Water and Indian Deep Water.",
                "type": "regional_info",
                "region": "indian_ocean",
                "importance": 0.8
            }
        ]
        
        count = 0
        try:
            with get_db_session() as db:
                for item in knowledge_items:
                    # Check if already exists
                    existing = db.query(VectorEmbedding).filter(
                        VectorEmbedding.content_type == 'knowledge',
                        VectorEmbedding.text_content == item['content']
                    ).first()
                    
                    if existing:
                        continue
                    
                    # Create embedding
                    embedding = self.create_embedding(item['content'])
                    
                    # Store in database
                    vector_embedding = VectorEmbedding(
                        content_type='knowledge',
                        content_id=f"knowledge_{count}",
                        text_content=item['content'],
                        embedding_model=self.model_name,
                        embedding=json.dumps(embedding),
                        language='en',
                        region=item['region'],
                        data_type=item['type'],
                        importance=item['importance']
                    )
                    
                    db.add(vector_embedding)
                    count += 1
                
                db.commit()
                logger.info(f"Created {count} knowledge embeddings")
                
        except Exception as e:
            logger.error(f"Failed to create knowledge embeddings: {e}")
        
        return count
    
    def _create_summary_text(self, summary: DataSummary) -> str:
        """Create text description from data summary."""
        text_parts = []
        
        if summary.region_name:
            text_parts.append(f"Region: {summary.region_name}")
        
        if summary.description:
            text_parts.append(summary.description)
        
        if summary.total_profiles:
            text_parts.append(f"Contains {summary.total_profiles} oceanographic profiles")
        
        if summary.avg_temperature:
            text_parts.append(f"Average temperature: {summary.avg_temperature:.1f}°C")
        
        if summary.avg_salinity:
            text_parts.append(f"Average salinity: {summary.avg_salinity:.1f} PSU")
        
        if summary.max_depth:
            text_parts.append(f"Maximum depth: {summary.max_depth:.0f} meters")
        
        return ". ".join(text_parts)
    
    def _create_float_text(self, float_obj: ArgoFloat) -> str:
        """Create text description from float metadata."""
        text_parts = [f"Argo float {float_obj.float_id} (WMO: {float_obj.wmo_id})"]
        
        if float_obj.last_latitude and float_obj.last_longitude:
            text_parts.append(f"located at {float_obj.last_latitude:.1f}°N, {float_obj.last_longitude:.1f}°E")
        
        if float_obj.status:
            text_parts.append(f"status: {float_obj.status}")
        
        if float_obj.deployment_date:
            text_parts.append(f"deployed in {float_obj.deployment_date.year}")
        
        if float_obj.has_core_data:
            text_parts.append("provides temperature and salinity measurements")
        
        if float_obj.has_bgc_data:
            text_parts.append("includes biogeochemical parameters")
        
        return ". ".join(text_parts)
    
    def _determine_region(self, lat: Optional[float], lon: Optional[float]) -> str:
        """Determine geographic region from coordinates."""
        if lat is None or lon is None:
            return "unknown"
        
        # Indian Ocean bounds
        if -40 <= lat <= 30 and -90 <= lon <= 90:
            return "indian_ocean"
        
        # Add other regions as needed
        return "global"
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        try:
            vec1 = np.array(vec1)
            vec2 = np.array(vec2)
            
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            return float(dot_product / (norm1 * norm2))
        except Exception as e:
            logger.error(f"Similarity calculation failed: {e}")
            return 0.0
    
    def _create_mock_embedding(self, text: str) -> List[float]:
        """Create mock embedding for development."""
        # Simple hash-based mock embedding
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_bytes = hash_obj.digest()
        
        # Convert to float values between -1 and 1
        embedding = []
        for i in range(0, len(hash_bytes), 2):
            if i + 1 < len(hash_bytes):
                val = (hash_bytes[i] + hash_bytes[i+1] * 256) / 65535.0 * 2 - 1
                embedding.append(val)
        
        # Pad to fixed size
        while len(embedding) < 384:  # MiniLM embedding size
            embedding.append(0.0)
        
        return embedding[:384]


# Singleton instance
_embedder_instance = None

def get_vector_embedder() -> VectorEmbedder:
    """Get singleton vector embedder instance."""
    global _embedder_instance
    if _embedder_instance is None:
        _embedder_instance = VectorEmbedder()
    return _embedder_instance


def initialize_embeddings() -> Dict[str, int]:
    """
    Initialize all embeddings for the system.
    
    Returns:
        Dict with counts of created embeddings
    """
    embedder = get_vector_embedder()
    
    results = {
        'summaries': embedder.embed_data_summaries(),
        'floats': embedder.embed_float_metadata(limit=50),  # Start with 50 floats
        'knowledge': embedder.create_knowledge_embeddings()
    }
    
    total = sum(results.values())
    logger.info(f"Initialized {total} embeddings: {results}")
    
    return results


# Export main functions
__all__ = [
    'VectorEmbedder',
    'get_vector_embedder',
    'initialize_embeddings'
]
