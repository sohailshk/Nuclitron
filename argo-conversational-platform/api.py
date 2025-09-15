"""
FastAPI application for Argo Conversational Platform.

This serves as the main API backend that connects the RAG system
to the frontend chat interface.

Author: Argo Platform Team
Created: 2025-09-14
"""

import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

from src.rag.orchestrator import ArgoRAGSystem
from src.data.ingestion.argo_fetcher import fetch_latest_indian_ocean_data
from src.data.database import get_db_session
from src.data.models import ArgoFloat, ArgoProfile, ArgoMeasurement, DataSummary
from src.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global RAG system instance
rag_system: Optional[ArgoRAGSystem] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global rag_system
    
    # Startup
    logger.info("Starting Argo Conversational Platform API...")
    try:
        rag_system = ArgoRAGSystem()
        logger.info("RAG system initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        rag_system = None
    
    yield
    
    # Shutdown
    logger.info("Shutting down Argo Conversational Platform API...")

# Create FastAPI app
app = FastAPI(
    title="Argo Conversational Platform API",
    description="Backend API for AI-powered oceanographic data analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., description="User's chat message")
    session_id: Optional[str] = Field(None, description="Session identifier")
    user_id: Optional[str] = Field(None, description="User identifier")

class ChatResponse(BaseModel):
    """Chat response model."""
    response_text: str = Field(..., description="AI response text")
    query_analysis: Dict[str, Any] = Field(default_factory=dict, description="Query analysis")
    data_results: Optional[List[Dict[str, Any]]] = Field(None, description="Data query results")
    total_data_rows: int = Field(0, description="Total number of data rows")
    visualization: Optional[Dict[str, Any]] = Field(None, description="Visualization specification")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    session_id: str = Field(..., description="Session identifier")
    timestamp: str = Field(..., description="Response timestamp")
    error: Optional[str] = Field(None, description="Error message if any")

class DataSummaryResponse(BaseModel):
    """Data summary response model."""
    floats: int = Field(..., description="Number of floats")
    profiles: int = Field(..., description="Number of profiles")
    measurements: int = Field(..., description="Number of measurements")
    summaries: int = Field(..., description="Number of data summaries")
    latest_data: Optional[str] = Field(None, description="Latest data timestamp")

class DataFetchRequest(BaseModel):
    """Data fetch request model."""
    days_back: int = Field(7, description="Number of days back to fetch data")
    region: Optional[str] = Field("indian_ocean", description="Geographic region")

# Dependency to get RAG system
def get_rag_system() -> ArgoRAGSystem:
    """Get RAG system instance."""
    if rag_system is None:
        raise HTTPException(status_code=503, detail="RAG system not available")
    return rag_system

# API Routes

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Argo Conversational Platform API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        with get_db_session() as db:
            float_count = db.query(ArgoFloat).count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "rag_system": "available" if rag_system else "unavailable",
            "data_points": float_count,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    rag_system: ArgoRAGSystem = Depends(get_rag_system)
):
    """
    Main chat endpoint for processing user queries.
    
    This endpoint processes natural language queries about oceanographic data
    and returns AI-generated responses with optional data visualizations.
    """
    try:
        logger.info(f"Processing chat request: {request.message[:100]}...")
        
        # Process query through RAG system
        result = await rag_system.process_query(
            user_query=request.message,
            session_id=request.session_id
        )
        
        # Convert to response model
        response = ChatResponse(
            response_text=result.get('response_text', 'Sorry, I could not process your request.'),
            query_analysis=result.get('query_analysis', {}),
            data_results=result.get('data_results'),
            total_data_rows=result.get('total_data_rows', 0),
            visualization=result.get('visualization'),
            processing_time_ms=result.get('processing_time_ms', 0),
            session_id=result.get('session_id', ''),
            timestamp=result.get('timestamp', datetime.now().isoformat())
        )
        
        logger.info(f"Chat request processed successfully in {response.processing_time_ms:.1f}ms")
        return response
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        return ChatResponse(
            response_text="I'm sorry, I encountered an error while processing your request. Please try again.",
            query_analysis={},
            processing_time_ms=0,
            session_id=request.session_id or f"error_{datetime.now().isoformat()}",
            timestamp=datetime.now().isoformat(),
            error=str(e)
        )

@app.get("/data/summary", response_model=DataSummaryResponse)
async def get_data_summary():
    """Get summary of available data in the database."""
    try:
        with get_db_session() as db:
            float_count = db.query(ArgoFloat).count()
            profile_count = db.query(ArgoProfile).count()
            measurement_count = db.query(ArgoMeasurement).count()
            summary_count = db.query(DataSummary).count()
            
            # Get latest data timestamp
            latest_profile = db.query(ArgoProfile).order_by(ArgoProfile.profile_date.desc()).first()
            latest_data = latest_profile.profile_date.isoformat() if latest_profile else None
            
            return DataSummaryResponse(
                floats=float_count,
                profiles=profile_count,
                measurements=measurement_count,
                summaries=summary_count,
                latest_data=latest_data
            )
            
    except Exception as e:
        logger.error(f"Data summary error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get data summary: {e}")

@app.post("/data/fetch")
async def fetch_data(
    request: DataFetchRequest,
    background_tasks: BackgroundTasks
):
    """
    Fetch new data from external sources.
    
    This endpoint triggers data fetching from ERDDAP or other sources
    and stores it in the database. Returns immediately while processing
    continues in the background.
    """
    try:
        def fetch_data_background():
            """Background task to fetch data."""
            logger.info(f"Starting background data fetch for {request.days_back} days")
            try:
                result = fetch_latest_indian_ocean_data(days_back=request.days_back)
                logger.info(f"Background data fetch completed: {result}")
            except Exception as e:
                logger.error(f"Background data fetch failed: {e}")
        
        # Start background task
        background_tasks.add_task(fetch_data_background)
        
        return {
            "message": "Data fetch started",
            "days_back": request.days_back,
            "region": request.region,
            "status": "processing",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Data fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start data fetch: {e}")

@app.get("/data/floats")
async def get_floats(limit: int = 10, offset: int = 0):
    """Get list of available floats."""
    try:
        with get_db_session() as db:
            floats = (
                db.query(ArgoFloat)
                .order_by(ArgoFloat.last_position_date.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            float_data = []
            for float_obj in floats:
                float_data.append({
                    "float_id": float_obj.float_id,
                    "wmo_id": float_obj.wmo_id,
                    "last_latitude": float_obj.last_latitude,
                    "last_longitude": float_obj.last_longitude,
                    "last_position_date": float_obj.last_position_date.isoformat() if float_obj.last_position_date else None,
                    "platform_type": float_obj.platform_type,
                    "status": float_obj.status,
                    "has_core_data": float_obj.has_core_data,
                    "has_bgc_data": float_obj.has_bgc_data
                })
            
            return {
                "floats": float_data,
                "total": len(float_data),
                "limit": limit,
                "offset": offset,
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Get floats error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get floats: {e}")

@app.get("/data/profiles/{float_id}")
async def get_float_profiles(float_id: int, limit: int = 10):
    """Get profiles for a specific float."""
    try:
        with get_db_session() as db:
            profiles = (
                db.query(ArgoProfile)
                .filter(ArgoProfile.float_id == float_id)
                .order_by(ArgoProfile.profile_date.desc())
                .limit(limit)
                .all()
            )
            
            profile_data = []
            for profile in profiles:
                profile_data.append({
                    "id": profile.id,
                    "cycle_number": profile.cycle_number,
                    "profile_date": profile.profile_date.isoformat() if profile.profile_date else None,
                    "latitude": profile.latitude,
                    "longitude": profile.longitude,
                    "data_mode": profile.data_mode,
                    "has_temperature": profile.has_temperature,
                    "has_salinity": profile.has_salinity,
                    "has_bgc_data": profile.has_bgc_data
                })
            
            return {
                "float_id": float_id,
                "profiles": profile_data,
                "total": len(profile_data),
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"Get profiles error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get profiles: {e}")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }
    )

# Main entry point
if __name__ == "__main__":
    settings = get_settings()
    
    # Run with uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )