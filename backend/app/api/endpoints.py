from fastapi import APIRouter, HTTPException, Query, Depends
from datetime import datetime, timedelta
from app.services.timeline_service import TimelineService
import logging
from pydantic import BaseModel
from typing import List, Optional
from app.dependencies import get_timeline_service

router = APIRouter()
logger = logging.getLogger(__name__)

# Define response model directly here
class FloatProfile(BaseModel):
    float_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    temperature: Optional[List[float]] = None
    salinity: Optional[List[float]] = None

class TimelineResponse(BaseModel):
    profiles: List[FloatProfile]
    monthly_averages: List[dict]
    metadata: dict

@router.get("/data", response_model=TimelineResponse)
async def get_timeline_data(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    region: str = Query("global", description="Region name"),
    parameter: str = Query("temperature", description="Parameter to analyze"),
    timeline_service: TimelineService = Depends(get_timeline_service)
):
    """Get timeline data for the specified period"""
    try:
        data = timeline_service.get_timeline_data(start_date, end_date, region, parameter)
        return data
    
    except Exception as e:
        logger.error(f"Error fetching timeline data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/regions")
async def get_available_regions(
    timeline_service: TimelineService = Depends(get_timeline_service)
):
    """Get list of available regions"""
    return {"regions": list(timeline_service.region_bboxes.keys())}

@router.get("/parameters")
async def get_available_parameters():
    """Get list of available parameters"""
    return {"parameters": ["temperature", "salinity"]}