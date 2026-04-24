"""
Simulation endpoints for UHI and Health Risk impact
"""

from fastapi import APIRouter, HTTPException
import logging

from schemas.types import SimulationRequest, SimulationResponse
from utils.helpers import simulate_uhi_impact

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=SimulationResponse)
async def simulate_impact(request: SimulationRequest):
    """
    Simulate UHI and Health Risk impact based on environmental parameters
    
    Request body:
    {
        "ndvi": 0.4,
        "built_up": 45,
        "humidity": 65,
        "temperature": 32
    }
    """
    try:
        # Simulate impact using helper function
        results = simulate_uhi_impact(
            ndvi=request.ndvi,
            built_up=request.built_up,
            humidity=request.humidity,
            temperature=request.temperature
        )
        
        return SimulationResponse(**results)
        
    except Exception as e:
        logger.error(f"Error in simulation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


