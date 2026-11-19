"""Starter ML training module for SafeRoute-AI.

This script demonstrates how to train a safety-scoring model once a dataset is available.
It outlines the end-to-end pipeline: data loading, preprocessing, model fitting,
evaluation, and exporting the trained model artifact.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional, Any

# Ensure project root is in sys.path when running script directly
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Relative or absolute import of preprocessing utilities
try:
    from ml.preprocessing import (
        load_dataset,
        clean_features,
        engineer_features,
        split_features_and_target,
    )
except ImportError:
    from preprocessing import (  # type: ignore
        load_dataset,
        clean_features,
        engineer_features,
        split_features_and_target,
    )

try:
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_squared_error, r2_score
except ImportError:
    train_test_split = None  # type: ignore
    RandomForestRegressor = None  # type: ignore
    mean_squared_error = None  # type: ignore
    r2_score = None  # type: ignore


def train_safety_model(
    dataset_path: str,
    output_model_path: str = "ml/models/safety_model.joblib",
    target_column: str = "safety_score",
) -> Optional[Any]:
    """Trains a machine learning model to estimate route/segment safety scores.

    Args:
        dataset_path: Path to the raw CSV training dataset.
        output_model_path: Path where the trained model artifact should be persisted.
        target_column: Name of the dependent variable to predict.

    Returns:
        Optional[Any]: Trained scikit-learn model, or None if dataset is absent.
    """
    if train_test_split is None or RandomForestRegressor is None:
        print("[Training] scikit-learn is not installed in the active environment.")
        print("[Training] Please install requirements: pip install -r backend/requirements.txt")
        return None

    # -------------------------------------------------------------------------
    # STEP 1: Verify and Load Dataset
    # -------------------------------------------------------------------------
    if not os.path.exists(dataset_path):
        print(f"[Training] Dataset not found at: '{dataset_path}'")
        print("[Training] TODO: Place your verified safety/incident dataset in ml/dataset/")
        print("[Training] Training skipped until real dataset is supplied.")
        return None

    # Load and clean dataset
    raw_df = load_dataset(dataset_path)
    cleaned_df = clean_features(raw_df)
    processed_df = engineer_features(cleaned_df)

    # -------------------------------------------------------------------------
    # STEP 2: Separate Features and Target Variable
    # -------------------------------------------------------------------------
    X, y = split_features_and_target(processed_df, target_column=target_column)

    # -------------------------------------------------------------------------
    # STEP 3: Train-Test Split
    # -------------------------------------------------------------------------
    print("[Training] Splitting data into training (80%) and test (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    # -------------------------------------------------------------------------
    # STEP 4: Model Initialization and Training
    # -------------------------------------------------------------------------
    # TODO: Experiment with different model architectures:
    # - RandomForestRegressor / RandomForestClassifier
    # - GradientBoostingRegressor / XGBoost / LightGBM
    # - Multi-Layer Perceptron (PyTorch or scikit-learn MLPRegressor)
    print("[Training] Initializing Random Forest model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )

    print("[Training] Fitting model on training data...")
    model.fit(X_train, y_train)

    # -------------------------------------------------------------------------
    # STEP 5: Model Evaluation
    # -------------------------------------------------------------------------
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print(f"[Training] Evaluation Results:")
    print(f"  - Mean Squared Error (MSE): {mse:.4f}")
    print(f"  - R-squared (R2 Score):     {r2:.4f}")

    # -------------------------------------------------------------------------
    # STEP 6: Save Model Artifact
    # -------------------------------------------------------------------------
    # TODO: Serialize and save the model weights using joblib or pickle
    # Example:
    # os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    # joblib.dump(model, output_model_path)
    # print(f"[Training] Saved trained model to: {output_model_path}")

    return model


if __name__ == "__main__":
    print("=" * 60)
    print("SafeRoute-AI Model Training Pipeline (Starter)")
    print("=" * 60)

    # Path to intended dataset
    SAMPLE_DATASET_PATH = "ml/dataset/safety_data.csv"
    train_safety_model(dataset_path=SAMPLE_DATASET_PATH)
