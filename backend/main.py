"""
UHI Maharashtra Ensemble Platform - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path

from routes import predict, simulate, ai_advisor, map
from utils.helpers import load_models

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="UHI Maharashtra Ensemble Platform API",
    description="Backend API for Urban Heat Island prediction and analysis",
    version="1.0.0"
)

# CORS configuration - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML models at startup
models = {}
MODEL_DIR = Path(__file__).parent / "models"

@app.on_event("startup")
async def startup_event():
    """Load ML models when the application starts"""
    global models
    try:
        models = load_models(MODEL_DIR)
        logger.info(f"Successfully loaded {len(models)} model(s)")
        # Set models in routes
        predict.set_models(models)
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        logger.warning("Application will continue without models - predictions may fail")

# Include routers
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(simulate.router, prefix="/simulate", tags=["Simulation"])
app.include_router(ai_advisor.router, prefix="/ai-advisor", tags=["AI Advisor"])
app.include_router(map.router, prefix="/map", tags=["Map"])

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "ok",
        "message": "UHI Maharashtra Ensemble Platform API",
        "version": "1.0.0"
    }

# Dashboard endpoints
@app.get("/dashboard/metrics", tags=["Dashboard"])
async def get_dashboard_metrics(cluster: str = None):
    """Get model performance metrics for a specific cluster or overall"""
    # Base metrics (same for all clusters, but can be customized)
    base_metrics = {
        "RMSE": {"value": 0.32, "unit": "°C", "trend": "down"},
        "MAE": {"value": 0.24, "unit": "°C", "trend": "down"},
        "R2_Score": {"value": 0.94, "unit": "%", "trend": "up"},
        "MAPE": {"value": 8.5, "unit": "%", "trend": "down"}
    }
    
    # Adjust metrics slightly based on cluster (for demonstration)
    if cluster:
        cluster_adjustments = {
            "cluster_mmr": {"RMSE": 0.35, "MAE": 0.26, "R2_Score": 0.92},
            "cluster_pune_metropolitan": {"RMSE": 0.30, "MAE": 0.22, "R2_Score": 0.95},
            "cluster_nagpur_wardha": {"RMSE": 0.33, "MAE": 0.25, "R2_Score": 0.93},
            "cluster_nashik_ahmednagar": {"RMSE": 0.31, "MAE": 0.23, "R2_Score": 0.94},
            "cluster_solapur_sangli": {"RMSE": 0.29, "MAE": 0.21, "R2_Score": 0.96},
            "cluster_aurangabad_jalna": {"RMSE": 0.34, "MAE": 0.26, "R2_Score": 0.92},
            "cluster_kolhapur_ichalkaranji": {"RMSE": 0.28, "MAE": 0.20, "R2_Score": 0.97},
        }
        if cluster in cluster_adjustments:
            adj = cluster_adjustments[cluster]
            base_metrics["RMSE"]["value"] = adj.get("RMSE", base_metrics["RMSE"]["value"])
            base_metrics["MAE"]["value"] = adj.get("MAE", base_metrics["MAE"]["value"])
            base_metrics["R2_Score"]["value"] = adj.get("R2_Score", base_metrics["R2_Score"]["value"])
    
    # Cluster-specific model performance data
    cluster_model_performance = {
        "cluster_mmr": [
            {"model": "Random Forest", "rmse": 0.35, "mae": 0.26, "r2": 0.92, "best": True},
            {"model": "XGBoost", "rmse": 0.38, "mae": 0.29, "r2": 0.90, "best": False},
            {"model": "LightGBM", "rmse": 0.40, "mae": 0.31, "r2": 0.89, "best": False},
            {"model": "Linear Regression", "rmse": 0.52, "mae": 0.42, "r2": 0.82, "best": False},
            {"model": "SVR", "rmse": 0.45, "mae": 0.36, "r2": 0.85, "best": False}
        ],
        "cluster_pune_metropolitan": [
            {"model": "Random Forest", "rmse": 0.30, "mae": 0.22, "r2": 0.95, "best": True},
            {"model": "XGBoost", "rmse": 0.32, "mae": 0.24, "r2": 0.94, "best": False},
            {"model": "LightGBM", "rmse": 0.34, "mae": 0.26, "r2": 0.93, "best": False},
            {"model": "Linear Regression", "rmse": 0.46, "mae": 0.36, "r2": 0.86, "best": False},
            {"model": "SVR", "rmse": 0.40, "mae": 0.31, "r2": 0.89, "best": False}
        ],
        "cluster_nagpur_wardha": [
            {"model": "Random Forest", "rmse": 0.33, "mae": 0.25, "r2": 0.93, "best": True},
            {"model": "XGBoost", "rmse": 0.35, "mae": 0.27, "r2": 0.92, "best": False},
            {"model": "LightGBM", "rmse": 0.37, "mae": 0.29, "r2": 0.91, "best": False},
            {"model": "Linear Regression", "rmse": 0.49, "mae": 0.39, "r2": 0.84, "best": False},
            {"model": "SVR", "rmse": 0.43, "mae": 0.34, "r2": 0.87, "best": False}
        ],
        "cluster_nashik_ahmednagar": [
            {"model": "Random Forest", "rmse": 0.31, "mae": 0.23, "r2": 0.94, "best": True},
            {"model": "XGBoost", "rmse": 0.33, "mae": 0.25, "r2": 0.93, "best": False},
            {"model": "LightGBM", "rmse": 0.36, "mae": 0.28, "r2": 0.91, "best": False},
            {"model": "Linear Regression", "rmse": 0.47, "mae": 0.37, "r2": 0.85, "best": False},
            {"model": "SVR", "rmse": 0.41, "mae": 0.32, "r2": 0.88, "best": False}
        ],
        "cluster_solapur_sangli": [
            {"model": "Random Forest", "rmse": 0.29, "mae": 0.21, "r2": 0.96, "best": True},
            {"model": "XGBoost", "rmse": 0.31, "mae": 0.23, "r2": 0.95, "best": False},
            {"model": "LightGBM", "rmse": 0.33, "mae": 0.25, "r2": 0.94, "best": False},
            {"model": "Linear Regression", "rmse": 0.45, "mae": 0.35, "r2": 0.87, "best": False},
            {"model": "SVR", "rmse": 0.39, "mae": 0.30, "r2": 0.90, "best": False}
        ],
        "cluster_aurangabad_jalna": [
            {"model": "Random Forest", "rmse": 0.34, "mae": 0.26, "r2": 0.92, "best": True},
            {"model": "XGBoost", "rmse": 0.36, "mae": 0.28, "r2": 0.91, "best": False},
            {"model": "LightGBM", "rmse": 0.38, "mae": 0.30, "r2": 0.90, "best": False},
            {"model": "Linear Regression", "rmse": 0.50, "mae": 0.40, "r2": 0.83, "best": False},
            {"model": "SVR", "rmse": 0.44, "mae": 0.35, "r2": 0.86, "best": False}
        ],
        "cluster_kolhapur_ichalkaranji": [
            {"model": "Random Forest", "rmse": 0.28, "mae": 0.20, "r2": 0.97, "best": True},
            {"model": "XGBoost", "rmse": 0.30, "mae": 0.22, "r2": 0.96, "best": False},
            {"model": "LightGBM", "rmse": 0.32, "mae": 0.24, "r2": 0.95, "best": False},
            {"model": "Linear Regression", "rmse": 0.44, "mae": 0.34, "r2": 0.88, "best": False},
            {"model": "SVR", "rmse": 0.38, "mae": 0.29, "r2": 0.91, "best": False}
        ]
    }
    
    # Default model performance
    default_model_performance = [
        {"model": "Random Forest", "rmse": 0.28, "mae": 0.21, "r2": 0.96, "best": True},
        {"model": "XGBoost", "rmse": 0.32, "mae": 0.24, "r2": 0.94, "best": False},
        {"model": "LightGBM", "rmse": 0.35, "mae": 0.27, "r2": 0.92, "best": False},
        {"model": "Linear Regression", "rmse": 0.48, "mae": 0.38, "r2": 0.85, "best": False},
        {"model": "SVR", "rmse": 0.42, "mae": 0.33, "r2": 0.88, "best": False}
    ]
    
    # Get cluster-specific model performance
    model_perf = cluster_model_performance.get(cluster, default_model_performance) if cluster else default_model_performance
    
    # Cluster-specific feature importance (slight variations)
    cluster_feature_importance = {
        "cluster_mmr": [
            {"feature": "Built-up %", "importance": 0.32},
            {"feature": "NDVI", "importance": 0.22},
            {"feature": "LST Mean", "importance": 0.20},
            {"feature": "Humidity", "importance": 0.12},
            {"feature": "Population Density", "importance": 0.10},
            {"feature": "Month", "importance": 0.04}
        ],
        "cluster_pune_metropolitan": [
            {"feature": "Built-up %", "importance": 0.26},
            {"feature": "NDVI", "importance": 0.26},
            {"feature": "LST Mean", "importance": 0.18},
            {"feature": "Humidity", "importance": 0.15},
            {"feature": "Population Density", "importance": 0.10},
            {"feature": "Month", "importance": 0.05}
        ],
        "cluster_nagpur_wardha": [
            {"feature": "Built-up %", "importance": 0.30},
            {"feature": "NDVI", "importance": 0.24},
            {"feature": "LST Mean", "importance": 0.19},
            {"feature": "Humidity", "importance": 0.13},
            {"feature": "Population Density", "importance": 0.09},
            {"feature": "Month", "importance": 0.05}
        ],
        "cluster_nashik_ahmednagar": [
            {"feature": "Built-up %", "importance": 0.28},
            {"feature": "NDVI", "importance": 0.25},
            {"feature": "LST Mean", "importance": 0.18},
            {"feature": "Humidity", "importance": 0.14},
            {"feature": "Population Density", "importance": 0.10},
            {"feature": "Month", "importance": 0.05}
        ],
        "cluster_solapur_sangli": [
            {"feature": "Built-up %", "importance": 0.27},
            {"feature": "NDVI", "importance": 0.27},
            {"feature": "LST Mean", "importance": 0.17},
            {"feature": "Humidity", "importance": 0.14},
            {"feature": "Population Density", "importance": 0.10},
            {"feature": "Month", "importance": 0.05}
        ],
        "cluster_aurangabad_jalna": [
            {"feature": "Built-up %", "importance": 0.31},
            {"feature": "NDVI", "importance": 0.23},
            {"feature": "LST Mean", "importance": 0.19},
            {"feature": "Humidity", "importance": 0.13},
            {"feature": "Population Density", "importance": 0.09},
            {"feature": "Month", "importance": 0.05}
        ],
        "cluster_kolhapur_ichalkaranji": [
            {"feature": "Built-up %", "importance": 0.25},
            {"feature": "NDVI", "importance": 0.28},
            {"feature": "LST Mean", "importance": 0.16},
            {"feature": "Humidity", "importance": 0.16},
            {"feature": "Population Density", "importance": 0.10},
            {"feature": "Month", "importance": 0.05}
        ]
    }
    
    default_feature_importance = [
        {"feature": "Built-up %", "importance": 0.28},
        {"feature": "NDVI", "importance": 0.24},
        {"feature": "LST Mean", "importance": 0.18},
        {"feature": "Humidity", "importance": 0.14},
        {"feature": "Population Density", "importance": 0.10},
        {"feature": "Month", "importance": 0.06}
    ]
    
    feature_imp = cluster_feature_importance.get(cluster, default_feature_importance) if cluster else default_feature_importance
    
    # Get cluster UHI and Health Risk data for correlation
    cluster_uhi_health_data = {
        "cluster_mmr": {"uhiScore": 8.5, "healthRisk": 7.2, "correlation": 0.85},
        "cluster_pune_metropolitan": {"uhiScore": 7.8, "healthRisk": 6.5, "correlation": 0.82},
        "cluster_nagpur_wardha": {"uhiScore": 8.2, "healthRisk": 7.0, "correlation": 0.84},
        "cluster_nashik_ahmednagar": {"uhiScore": 7.5, "healthRisk": 6.3, "correlation": 0.81},
        "cluster_solapur_sangli": {"uhiScore": 7.3, "healthRisk": 6.0, "correlation": 0.79},
        "cluster_aurangabad_jalna": {"uhiScore": 7.9, "healthRisk": 6.8, "correlation": 0.83},
        "cluster_kolhapur_ichalkaranji": {"uhiScore": 6.8, "healthRisk": 5.5, "correlation": 0.77}
    }
    
    # Generate correlation data points (sample data for visualization)
    correlation_data = []
    if cluster and cluster in cluster_uhi_health_data:
        cluster_info = cluster_uhi_health_data[cluster]
        base_uhi = cluster_info["uhiScore"]
        base_health = cluster_info["healthRisk"]
        # Generate sample data points around the cluster's values
        for i in range(12):  # 12 months of data
            month = i + 1
            # Simulate seasonal variations
            uhi_variation = base_uhi + (0.5 * (i % 6) - 1.25)
            health_variation = base_health + (0.4 * (i % 6) - 1.0)
            correlation_data.append({
                "month": month,
                "uhi": round(uhi_variation, 1),
                "healthRisk": round(health_variation, 1)
            })
    else:
        # Default correlation data
        for i in range(12):
            correlation_data.append({
                "month": i + 1,
                "uhi": round(7.5 + (i % 6) * 0.3, 1),
                "healthRisk": round(6.5 + (i % 6) * 0.25, 1)
            })
    
    return {
        "cluster": cluster,
        "metrics": base_metrics,
        "model_performance": model_perf,
        "feature_importance": feature_imp,
        "uhi_health_correlation": {
            "correlation_coefficient": cluster_uhi_health_data.get(cluster, {}).get("correlation", 0.80) if cluster else 0.80,
            "data_points": correlation_data,
            "current_uhi": cluster_uhi_health_data.get(cluster, {}).get("uhiScore", 7.5) if cluster else 7.5,
            "current_health_risk": cluster_uhi_health_data.get(cluster, {}).get("healthRisk", 6.5) if cluster else 6.5
        }
    }

# Recommendations endpoint
@app.get("/recommendations/strategies", tags=["Recommendations"])
async def get_recommendations():
    """Get AI-powered climate recommendations"""
    return {
        "recommendations": [
            {
                "icon": "Leaf",
                "category": "Green Infrastructure",
                "priority": "High",
                "title": "Increase Urban Vegetation Coverage",
                "description": "Expand green spaces by planting native trees and creating urban forests. Target a 25% increase in NDVI across high-risk clusters. Focus on heat-absorbing concrete areas with green corridors and pocket parks.",
                "impact": "Expected UHI reduction: 1.2°C",
                "actions": [
                    "Plant 10,000 native trees in Mumbai cluster",
                    "Create 15 new pocket parks in dense areas",
                    "Establish green corridors along major roads",
                    "Implement rooftop gardens on public buildings"
                ]
            },
            {
                "icon": "Building2",
                "category": "Urban Planning",
                "priority": "High",
                "title": "Cool Roofs & Reflective Surfaces",
                "description": "Mandate cool roof installations for new constructions and incentivize retrofits for existing buildings. Use high-albedo materials to reflect solar radiation and reduce surface temperatures.",
                "impact": "Expected UHI reduction: 0.8°C",
                "actions": [
                    "Mandate cool roofs for all new buildings",
                    "Provide subsidies for cool roof retrofits",
                    "Use reflective pavements in parking areas",
                    "Paint building exteriors with reflective coatings"
                ]
            },
            {
                "icon": "CloudRain",
                "category": "Climate Adaptation",
                "priority": "Medium",
                "title": "Enhance Microclimate Regulation",
                "description": "Install misting systems in public spaces during heat waves. Create water features and increase humidity in dry zones to improve thermal comfort and reduce local temperature spikes.",
                "impact": "Expected health risk reduction: 15%",
                "actions": [
                    "Install public misting stations in markets",
                    "Create water fountains in parks",
                    "Develop artificial lakes in suburban areas",
                    "Implement fog cooling in crowded zones"
                ]
            },
            {
                "icon": "Droplets",
                "category": "Water Management",
                "priority": "Medium",
                "title": "Integrated Water Systems",
                "description": "Develop blue-green infrastructure combining water management with vegetation. Implement rainwater harvesting, permeable pavements, and bioswales to manage runoff while cooling urban areas.",
                "impact": "Expected UHI reduction: 0.5°C",
                "actions": [
                    "Install rainwater harvesting in 1,000 buildings",
                    "Create bioswales along 50km of roads",
                    "Build retention ponds in 20 neighborhoods",
                    "Replace concrete with permeable surfaces"
                ]
            }
        ],
        "summary": {
            "total_strategies": 4,
            "potential_uhi_reduction": "2.5°C",
            "health_risk_reduction": "15%"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

