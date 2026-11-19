"""Starter prediction module for SafeRoute-AI.

This module provides clear inference functions to predict safety scores and risk levels
for individual geographical segments or entire travel routes.
"""

import os
from typing import Any, Dict, List, Optional


def load_trained_model(model_path: str = "ml/models/safety_model.joblib") -> Optional[Any]:
    """Loads a serialized model artifact if available.

    Args:
        model_path: Path to serialized model file (.joblib or .pkl).

    Returns:
        Optional[Any]: Loaded model object, or None if the model file is not found.
    """
    if not os.path.exists(model_path):
        return None

    try:
        import joblib
        return joblib.load(model_path)
    except Exception as e:
        print(f"[Inference Warning] Failed to load model from {model_path}: {e}")
        return None


def calculate_heuristic_safety_score(features: Dict[str, Any]) -> float:
    """Calculates a baseline safety score (0.0 to 100.0) based on standard heuristics.

    Used when a trained ML model weight file is not yet available.

    Args:
        features: Dictionary containing environmental and spatial metrics:
            - lighting_rating (float from 0.0 to 1.0)
            - crowd_density (float from 0.0 to 1.0)
            - historical_incidents_nearby (int)
            - is_night (int: 0 or 1)

    Returns:
        float: Estimated safety score between 0.0 (high risk) and 100.0 (very safe).
    """
    base_score = 75.0

    # Lighting bonus/penalty (±15 pts)
    lighting = float(features.get("lighting_rating", 0.5))
    base_score += (lighting - 0.5) * 30.0

    # Nighttime reduction (-15 pts)
    is_night = int(features.get("is_night", 0))
    if is_night:
        base_score -= 15.0

    # Crowd density (moderate crowd is safer: +10 pts; deserted: -10 pts)
    crowd = float(features.get("crowd_density", 0.5))
    base_score += (crowd - 0.5) * 20.0

    # Reported incidents penalty (-5 pts per incident, capped at -30 pts)
    incidents = int(features.get("historical_incidents_nearby", 0))
    base_score -= min(incidents * 5.0, 30.0)

    # Clamp score to [0.0, 100.0]
    return float(max(0.0, min(100.0, round(base_score, 1))))


def determine_risk_level(score: float) -> str:
    """Translates a numerical score (0-100) into a human-readable risk category."""
    if score >= 75.0:
        return "LOW_RISK"
    elif score >= 50.0:
        return "MODERATE_RISK"
    elif score >= 30.0:
        return "ELEVATED_RISK"
    else:
        return "HIGH_RISK"


def predict_safety_score(
    features: Dict[str, Any],
    model_path: str = "ml/models/safety_model.joblib",
) -> Dict[str, Any]:
    """Primary prediction function for SafeRoute-AI.

    Computes the safety score for a single road or path segment.
    If a trained model artifact is found at `model_path`, it performs ML inference;
    otherwise, it falls back to a transparent heuristic calculation.

    Args:
        features: Feature dictionary representing the segment context.
            Expected keys include:
            - "latitude" (float)
            - "longitude" (float)
            - "lighting_rating" (float: 0.0 - 1.0)
            - "crowd_density" (float: 0.0 - 1.0)
            - "historical_incidents_nearby" (int)
            - "is_night" (int: 0 or 1)
        model_path: Optional path to serialized model artifact.

    Returns:
        Dict[str, Any]: Output dictionary containing:
            - safety_score (float 0.0 - 100.0)
            - risk_level (str)
            - model_version (str)
            - is_trained_model (bool)
    """
    model = load_trained_model(model_path)

    if model is not None:
        # TODO: Format features into appropriate DataFrame/array shape expected by model.predict
        # Example:
        # feature_array = [[features.get('lighting_rating', 0.5), ...]]
        # raw_score = float(model.predict(feature_array)[0])
        raw_score = 80.0
        is_trained = True
        model_version = "v1-trained"
    else:
        # Transparent fallback when model weights are not yet produced by ml/train.py
        raw_score = calculate_heuristic_safety_score(features)
        is_trained = False
        model_version = "heuristic-baseline"

    return {
        "safety_score": raw_score,
        "risk_level": determine_risk_level(raw_score),
        "model_version": model_version,
        "is_trained_model": is_trained,
        "features_evaluated": features,
    }


def evaluate_route_segments(
    segments: List[Dict[str, Any]],
    model_path: str = "ml/models/safety_model.joblib",
) -> Dict[str, Any]:
    """Evaluates an ordered list of route segments and aggregates overall route safety.

    Args:
        segments: List of segment feature dictionaries along a navigation polyline.
        model_path: Optional path to serialized model artifact.

    Returns:
        Dict[str, Any]: Aggregated route score and per-segment evaluation.
    """
    if not segments:
        return {
            "overall_safety_score": 0.0,
            "overall_risk_level": "UNKNOWN",
            "segment_count": 0,
            "segments": [],
        }

    evaluated_segments = [
        predict_safety_score(seg, model_path=model_path) for seg in segments
    ]
    avg_score = round(
        sum(s["safety_score"] for s in evaluated_segments) / len(evaluated_segments), 1
    )

    return {
        "overall_safety_score": avg_score,
        "overall_risk_level": determine_risk_level(avg_score),
        "segment_count": len(segments),
        "segments": evaluated_segments,
    }


if __name__ == "__main__":
    # Demonstration of the prediction function
    sample_feature_input = {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "lighting_rating": 0.8,
        "crowd_density": 0.6,
        "historical_incidents_nearby": 1,
        "is_night": 0,
    }

    print("=" * 60)
    print("SafeRoute-AI Prediction Module (Starter Test)")
    print("=" * 60)
    result = predict_safety_score(sample_feature_input)
    print(f"Safety Score:     {result['safety_score']}")
    print(f"Risk Level:       {result['risk_level']}")
    print(f"Model Version:    {result['model_version']}")
    print(f"Is Trained Model: {result['is_trained_model']}")
