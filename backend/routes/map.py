"""
Map and cluster data endpoints
"""

from fastapi import APIRouter, HTTPException
import logging
from typing import List, Dict, Any

from schemas.types import ClusterData, ZoneDetails

logger = logging.getLogger(__name__)
router = APIRouter()

# Cluster data - in production, this would come from a database
CLUSTERS_DATA = [
    {
        "name": "Mumbai",
        "coords": {"lat": 19.076, "lng": 72.8777},
        "uhiScore": 8.5,
        "healthRisk": 7.2,
        "vegetation": 22,
        "zone": "hot",
        "boundary": [
            {"lat": 19.5, "lng": 72.5},
            {"lat": 19.5, "lng": 73.5},
            {"lat": 18.6, "lng": 73.5},
            {"lat": 18.6, "lng": 72.5},
        ],
    },
    {
        "name": "Pune",
        "coords": {"lat": 18.5204, "lng": 73.8567},
        "uhiScore": 7.8,
        "healthRisk": 6.5,
        "vegetation": 28,
        "zone": "moderately-hot",
        "boundary": [
            {"lat": 19.0, "lng": 73.4},
            {"lat": 19.0, "lng": 74.6},
            {"lat": 18.0, "lng": 74.6},
            {"lat": 18.0, "lng": 73.4},
        ],
    },
    {
        "name": "Nagpur-Wardha",
        "coords": {"lat": 21.1458, "lng": 79.0882},
        "uhiScore": 8.2,
        "healthRisk": 7.0,
        "vegetation": 25,
        "zone": "hot",
        "boundary": [
            {"lat": 21.6, "lng": 78.5},
            {"lat": 21.6, "lng": 79.8},
            {"lat": 20.5, "lng": 79.8},
            {"lat": 20.5, "lng": 78.5},
        ],
    },
    {
        "name": "Nashik-Ahmednagar",
        "coords": {"lat": 19.9975, "lng": 73.7898},
        "uhiScore": 7.5,
        "healthRisk": 6.3,
        "vegetation": 30,
        "zone": "warm",
        "boundary": [
            {"lat": 20.5, "lng": 73.2},
            {"lat": 20.5, "lng": 75.0},
            {"lat": 19.3, "lng": 75.0},
            {"lat": 19.3, "lng": 73.2},
        ],
    },
    {
        "name": "Solapur-Sangli",
        "coords": {"lat": 17.6599, "lng": 75.9064},
        "uhiScore": 7.3,
        "healthRisk": 6.0,
        "vegetation": 32,
        "zone": "warm",
        "boundary": [
            {"lat": 18.2, "lng": 74.8},
            {"lat": 18.2, "lng": 76.8},
            {"lat": 16.8, "lng": 76.8},
            {"lat": 16.8, "lng": 74.8},
        ],
    },
    {
        "name": "Aurangabad-Jalna",
        "coords": {"lat": 19.8762, "lng": 75.3433},
        "uhiScore": 7.9,
        "healthRisk": 6.8,
        "vegetation": 26,
        "zone": "moderately-hot",
        "boundary": [
            {"lat": 20.6, "lng": 74.5},
            {"lat": 20.6, "lng": 76.5},
            {"lat": 19.2, "lng": 76.5},
            {"lat": 19.2, "lng": 74.5},
        ],
    },
    {
        "name": "Kolhapur-Ichalkarangi",
        "coords": {"lat": 16.7050, "lng": 74.2433},
        "uhiScore": 6.8,
        "healthRisk": 5.5,
        "vegetation": 35,
        "zone": "cold",
        "boundary": [
            {"lat": 17.2, "lng": 73.5},
            {"lat": 17.2, "lng": 74.9},
            {"lat": 15.9, "lng": 74.9},
            {"lat": 15.9, "lng": 73.5},
        ],
    },
]

# Zone details with recommendations
ZONE_DETAILS = {
    "Mumbai": {
        "description": "Mumbai Metropolitan Region shows high UHI intensity due to dense urbanization and limited green spaces.",
        "recommendations": [
            "Increase green cover by 25% in high-density areas",
            "Implement cool roof programs",
            "Create urban forests in suburban areas"
        ]
    },
    "Pune": {
        "description": "Pune Metropolitan Region has moderate UHI with potential for improvement through green infrastructure.",
        "recommendations": [
            "Expand green corridors along major roads",
            "Promote rooftop gardens",
            "Implement water-sensitive urban design"
        ]
    },
    "Nagpur-Wardha": {
        "description": "Nagpur-Wardha cluster experiences high temperatures with moderate UHI effects.",
        "recommendations": [
            "Increase tree plantation in urban areas",
            "Develop cooling infrastructure",
            "Promote reflective surfaces"
        ]
    },
    "Nashik-Ahmednagar": {
        "description": "Nashik-Ahmednagar region shows moderate UHI with good potential for mitigation.",
        "recommendations": [
            "Enhance existing green spaces",
            "Implement cool pavements",
            "Create micro-climate zones"
        ]
    },
    "Solapur-Sangli": {
        "description": "Solapur-Sangli cluster has moderate UHI with opportunities for green infrastructure.",
        "recommendations": [
            "Develop urban parks",
            "Implement water conservation measures",
            "Promote sustainable building practices"
        ]
    },
    "Aurangabad-Jalna": {
        "description": "Aurangabad-Jalna region shows moderately high UHI with scope for improvement.",
        "recommendations": [
            "Increase vegetation coverage",
            "Implement heat mitigation strategies",
            "Develop green infrastructure"
        ]
    },
    "Kolhapur-Ichalkarangi": {
        "description": "Kolhapur-Ichalkarangi has the lowest UHI intensity with good vegetation coverage.",
        "recommendations": [
            "Maintain existing green cover",
            "Continue sustainable practices",
            "Monitor and prevent future degradation"
        ]
    }
}


@router.get("/clusters", response_model=List[ClusterData])
async def get_clusters():
    """
    Get all cluster data for map visualization
    
    Returns list of clusters with coordinates, UHI scores, health risk, vegetation, and zone information
    """
    try:
        return CLUSTERS_DATA
    except Exception as e:
        logger.error(f"Error fetching clusters: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch clusters: {str(e)}")


@router.get("/zone/{name}", response_model=ZoneDetails)
async def get_zone_details(name: str):
    """
    Get detailed information for a specific zone/cluster
    
    Args:
        name: Name of the cluster/zone
    """
    try:
        # Find cluster data
        cluster = next((c for c in CLUSTERS_DATA if c["name"] == name), None)
        if not cluster:
            raise HTTPException(status_code=404, detail=f"Zone '{name}' not found")
        
        # Get additional details
        details = ZONE_DETAILS.get(name, {})
        
        return ZoneDetails(
            name=cluster["name"],
            zone=cluster["zone"],
            uhiScore=cluster["uhiScore"],
            healthRisk=cluster["healthRisk"],
            vegetation=cluster["vegetation"],
            description=details.get("description"),
            recommendations=details.get("recommendations")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching zone details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch zone details: {str(e)}")


