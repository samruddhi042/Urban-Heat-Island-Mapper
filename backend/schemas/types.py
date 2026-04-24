"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# Prediction schemas
class PredictionFeatures(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    month: int = Field(..., ge=1, le=12, description="Month of the year (1-12)")


class SinglePredictionRequest(BaseModel):
    cluster: str = Field(..., description="Cluster identifier")
    features: PredictionFeatures


class PredictionResponse(BaseModel):
    cluster: str
    predictions: Dict[str, float]


class BatchPredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]


# Simulation schemas
class SimulationRequest(BaseModel):
    ndvi: float = Field(..., ge=0, le=1, description="NDVI (Normalized Difference Vegetation Index)")
    built_up: float = Field(..., ge=0, le=100, description="Built-up area percentage")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity percentage")
    temperature: float = Field(..., ge=-50, le=60, description="Ambient temperature in Celsius")


class SimulationResponse(BaseModel):
    uhi_before: float
    uhi_after: float
    health_risk_before: float
    health_risk_after: float
    improvement: float


# AI Advisor schemas
class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt/question")


class ChatResponse(BaseModel):
    response: str


# Map schemas
class ClusterCoordinates(BaseModel):
    lat: float
    lng: float


class ClusterData(BaseModel):
    name: str
    coords: ClusterCoordinates
    uhiScore: float
    healthRisk: float
    vegetation: float
    zone: str
    boundary: List[ClusterCoordinates]


class ZoneDetails(BaseModel):
    name: str
    zone: str
    uhiScore: float
    healthRisk: float
    vegetation: float
    description: Optional[str] = None
    recommendations: Optional[List[str]] = None


