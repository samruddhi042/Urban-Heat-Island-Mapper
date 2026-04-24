"""
Helper utilities for model loading and prediction
"""

import logging
import joblib
from pathlib import Path
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def load_models(model_dir: Path) -> Dict[str, Any]:
    """
    Load all .joblib models from the models directory
    
    Supports both generic model names and cluster-specific models.
    Cluster-specific models are named like: cluster_<name>__<type>.joblib
    
    Args:
        model_dir: Path to the models directory
        
    Returns:
        Dictionary with model identifiers as keys and loaded models as values
    """
    models = {}
    model_dir = Path(model_dir)
    
    if not model_dir.exists():
        logger.warning(f"Models directory does not exist: {model_dir}")
        return models
    
    # Try to load generic models first
    generic_model_files = {
        "uhi_model": "uhi_model.joblib",
        "health_index_model": "health_index_model.joblib"
    }
    
    for model_name, filename in generic_model_files.items():
        model_path = model_dir / filename
        if model_path.exists():
            try:
                models[model_name] = joblib.load(model_path)
                logger.info(f"Loaded {model_name} from {model_path}")
            except Exception as e:
                logger.error(f"Error loading {model_name} from {model_path}: {e}")
    
    # Always load cluster-specific models (they may exist alongside generic models)
    logger.info("Loading cluster-specific models...")
    cluster_models_loaded = 0
    for model_file in model_dir.glob("*.joblib"):
        # Skip generic model files we already loaded
        if model_file.name in ["uhi_model.joblib", "health_index_model.joblib"]:
            continue
        try:
            model_name = model_file.stem  # e.g., "cluster_pune_metropolitan__UHI_Intensity_C"
            models[model_name] = joblib.load(model_file)
            logger.info(f"Loaded cluster-specific model: {model_name}")
            cluster_models_loaded += 1
        except Exception as e:
            logger.error(f"Error loading {model_file}: {e}")
    
    if cluster_models_loaded > 0:
        logger.info(f"Successfully loaded {cluster_models_loaded} cluster-specific model(s)")
    elif not models:
        logger.warning("No models found in models directory")
    
    return models


def prepare_features(
    latitude: float,
    longitude: float,
    month: int,
    cluster: str,
    additional_features: Optional[Dict[str, float]] = None
) -> np.ndarray:
    """
    Prepare feature array for model prediction
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        month: Month (1-12)
        cluster: Cluster identifier
        additional_features: Optional additional features (NDVI, built_up, humidity, etc.)
        
    Returns:
        Numpy array of features ready for model prediction
    """
    # Base features
    features = {
        "latitude": latitude,
        "longitude": longitude,
        "month": month,
    }
    
    # Add cluster encoding (one-hot or numeric encoding)
    # For now, we'll use a simple numeric encoding based on cluster name
    cluster_encoding = hash(cluster) % 1000  # Simple hash-based encoding
    features["cluster_encoded"] = cluster_encoding
    
    # Add additional features if provided
    if additional_features:
        features.update(additional_features)
    
    # Convert to array in the expected order
    # Adjust this based on your actual model's expected feature order
    feature_order = [
        "latitude",
        "longitude",
        "month",
        "cluster_encoded"
    ]
    
    # Add additional features in order if they exist
    if additional_features:
        feature_order.extend([k for k in additional_features.keys() if k not in feature_order])
    
    feature_array = np.array([features.get(key, 0.0) for key in feature_order])
    
    return feature_array.reshape(1, -1)


def predict_uhi_intensity(
    model: Any,
    features: np.ndarray,
    cluster: Optional[str] = None
) -> float:
    """
    Predict UHI intensity using the model
    
    Args:
        model: Loaded ML model
        features: Feature array
        cluster: Optional cluster name for cluster-specific models
        
    Returns:
        Predicted UHI intensity in Celsius
    """
    try:
        prediction = model.predict(features)
        # Ensure we return a scalar
        if isinstance(prediction, np.ndarray):
            return float(prediction[0])
        return float(prediction)
    except Exception as e:
        logger.error(f"Error in UHI prediction: {e}")
        raise


def get_cluster_model(models: Dict[str, Any], cluster: str, model_type: str) -> Optional[Any]:
    """
    Get cluster-specific model if available
    
    Args:
        models: Dictionary of loaded models
        cluster: Cluster identifier
        model_type: Type of model ("UHI_Intensity_C" or "Health_Risk_Index")
        
    Returns:
        Model if found, None otherwise
    """
    model_key = f"{cluster}__{model_type}"
    return models.get(model_key)


def predict_health_risk(
    model: Any,
    features: np.ndarray,
    cluster: Optional[str] = None
) -> float:
    """
    Predict health risk index using the model
    
    Args:
        model: Loaded ML model
        features: Feature array
        cluster: Optional cluster name for cluster-specific models
        
    Returns:
        Predicted health risk index (0-10 scale)
    """
    try:
        prediction = model.predict(features)
        # Ensure we return a scalar
        if isinstance(prediction, np.ndarray):
            return float(prediction[0])
        return float(prediction)
    except Exception as e:
        logger.error(f"Error in health risk prediction: {e}")
        raise


def simulate_uhi_impact(
    ndvi: float,
    built_up: float,
    humidity: float,
    temperature: float,
    base_uhi: Optional[float] = None,
    base_health_risk: Optional[float] = None
) -> Dict[str, float]:
    """
    Simulate UHI and health risk impact based on environmental parameters
    
    This uses heuristic formulas when models are not available.
    In production, this should use the actual ML models.
    
    Args:
        ndvi: NDVI value (0-1)
        built_up: Built-up percentage (0-100)
        humidity: Humidity percentage (0-100)
        temperature: Temperature in Celsius
        base_uhi: Base UHI intensity (if None, calculated from params)
        base_health_risk: Base health risk (if None, calculated from params)
        
    Returns:
        Dictionary with before/after UHI and health risk values
    """
    # Default baseline values
    baseline_ndvi = 0.3
    baseline_built_up = 45.0
    baseline_humidity = 65.0
    baseline_temp = 32.0
    
    # Calculate baseline UHI if not provided
    if base_uhi is None:
        # Heuristic: UHI increases with built-up, decreases with NDVI
        base_uhi = (
            (baseline_built_up / 100) * 4.0 +  # Built-up contribution
            (1 - baseline_ndvi) * 2.0 +  # Low vegetation contribution
            (baseline_temp - 25) * 0.1  # Temperature contribution
        )
    
    # Calculate new UHI
    new_uhi = (
        (built_up / 100) * 4.0 +
        (1 - ndvi) * 2.0 +
        (temperature - 25) * 0.1
    )
    
    # Calculate baseline health risk if not provided
    if base_health_risk is None:
        # Health risk increases with UHI and temperature
        base_health_risk = (
            base_uhi * 1.5 +  # UHI contribution
            (baseline_temp - 25) * 0.2 +  # Temperature contribution
            (100 - baseline_humidity) * 0.05  # Low humidity increases risk
        )
        # Clamp to 0-10 scale
        base_health_risk = max(0, min(10, base_health_risk))
    
    # Calculate new health risk
    new_health_risk = (
        new_uhi * 1.5 +
        (temperature - 25) * 0.2 +
        (100 - humidity) * 0.05
    )
    new_health_risk = max(0, min(10, new_health_risk))
    
    # Calculate improvement percentage
    improvement = 0.0
    if base_uhi > 0:
        uhi_improvement = ((base_uhi - new_uhi) / base_uhi) * 100
        health_improvement = ((base_health_risk - new_health_risk) / base_health_risk) * 100
        improvement = (uhi_improvement + health_improvement) / 2
    
    return {
        "uhi_before": round(base_uhi, 2),
        "uhi_after": round(new_uhi, 2),
        "health_risk_before": round(base_health_risk, 2),
        "health_risk_after": round(new_health_risk, 2),
        "improvement": round(improvement, 2)
    }

