"""
Prediction endpoints for UHI and Health Risk Index
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import logging
from typing import List, Dict, Any
import io

from schemas.types import (
    SinglePredictionRequest,
    PredictionResponse,
    BatchPredictionResponse
)
from utils.helpers import (
    prepare_features,
    predict_uhi_intensity,
    predict_health_risk,
    get_cluster_model
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Global models - will be set from main.py
models = {}


def set_models(app_models: Dict[str, Any]):
    """Set the models from the main app"""
    global models
    models = app_models


@router.post("/single", response_model=PredictionResponse)
async def predict_single(request: SinglePredictionRequest):
    """
    Predict UHI Intensity and Health Risk Index for a single location
    
    Request body:
    {
        "cluster": "cluster_pune_metropolitan",
        "features": {
            "latitude": 18.52,
            "longitude": 73.85,
            "month": 6
        }
    }
    """
    try:
        # Check if models are loaded
        if not models:
            logger.warning("Models not loaded, using fallback predictions")
            # Fallback predictions based on heuristics
            uhi = 3.2 + (request.features.latitude - 19.0) * 0.1
            health_risk = 7.0 + (request.features.latitude - 19.0) * 0.05
            return PredictionResponse(
                cluster=request.cluster,
                predictions={
                    "UHI_Intensity_C": round(uhi, 2),
                    "Health_Risk_Index": round(health_risk, 2)
                }
            )
        
        # Prepare features
        features = prepare_features(
            latitude=request.features.latitude,
            longitude=request.features.longitude,
            month=request.features.month,
            cluster=request.cluster
        )
        
        # Try to get cluster-specific models first, then generic models
        uhi_model = get_cluster_model(models, request.cluster, "UHI_Intensity_C")
        if not uhi_model:
            uhi_model = models.get("uhi_model")
        
        if uhi_model:
            uhi_intensity = predict_uhi_intensity(uhi_model, features, request.cluster)
        else:
            # Fallback calculation
            uhi_intensity = 3.2 + (request.features.latitude - 19.0) * 0.1
            logger.warning("UHI model not available, using fallback")
        
        # Predict Health Risk Index
        health_model = get_cluster_model(models, request.cluster, "Health_Risk_Index")
        if not health_model:
            health_model = models.get("health_index_model")
        
        if health_model:
            health_risk = predict_health_risk(health_model, features, request.cluster)
        else:
            # Fallback calculation
            health_risk = 7.0 + (request.features.latitude - 19.0) * 0.05
            logger.warning("Health risk model not available, using fallback")
        
        return PredictionResponse(
            cluster=request.cluster,
            predictions={
                "UHI_Intensity_C": round(uhi_intensity, 2),
                "Health_Risk_Index": round(health_risk, 2)
            }
        )
        
    except Exception as e:
        logger.error(f"Error in single prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/batch", response_model=BatchPredictionResponse)
async def predict_batch(file: UploadFile = File(...)):
    """
    Predict UHI Intensity and Health Risk Index for multiple locations from CSV
    
    CSV should contain columns: latitude, longitude, month, cluster (optional)
    """
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = ["latitude", "longitude", "month"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_columns}"
            )
        
        # Default cluster if not provided
        if "cluster" not in df.columns:
            df["cluster"] = "cluster_pune_metropolitan"
        
        predictions = []
        
        for idx, row in df.iterrows():
            try:
                cluster_name = str(row.get("cluster", "cluster_pune_metropolitan"))
                
                # Prepare features
                features = prepare_features(
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    month=int(row["month"]),
                    cluster=cluster_name
                )
                
                # Predict UHI Intensity
                uhi_model = get_cluster_model(models, cluster_name, "UHI_Intensity_C")
                if not uhi_model:
                    uhi_model = models.get("uhi_model")
                
                if uhi_model:
                    uhi_intensity = predict_uhi_intensity(uhi_model, features, cluster_name)
                else:
                    uhi_intensity = 3.2 + (float(row["latitude"]) - 19.0) * 0.1
                
                # Predict Health Risk Index
                health_model = get_cluster_model(models, cluster_name, "Health_Risk_Index")
                if not health_model:
                    health_model = models.get("health_index_model")
                
                if health_model:
                    health_risk = predict_health_risk(health_model, features, cluster_name)
                else:
                    health_risk = 7.0 + (float(row["latitude"]) - 19.0) * 0.05
                
                predictions.append({
                    "row_index": int(idx),
                    "cluster": str(row.get("cluster", "cluster_pune_metropolitan")),
                    "latitude": float(row["latitude"]),
                    "longitude": float(row["longitude"]),
                    "month": int(row["month"]),
                    "UHI_Intensity_C": round(uhi_intensity, 2),
                    "Health_Risk_Index": round(health_risk, 2)
                })
                
            except Exception as e:
                logger.error(f"Error processing row {idx}: {e}")
                predictions.append({
                    "row_index": int(idx),
                    "error": str(e)
                })
        
        return BatchPredictionResponse(predictions=predictions)
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except pd.errors.ParserError as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

