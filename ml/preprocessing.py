"""Starter data preprocessing module for SafeRoute-AI.

This module provides data loading, cleaning, and feature engineering utilities
designed to transform raw geographical and urban safety datasets into structured
feature matrices suitable for machine learning model training.
"""

from __future__ import annotations

import os
import sys
from typing import Tuple, Any

try:
    import numpy as np
    import pandas as pd
except ImportError:
    np = None  # type: ignore
    pd = None  # type: ignore


def load_dataset(file_path: str) -> Any:
    """Loads raw tabular dataset (CSV) from the dataset directory.

    Args:
        file_path: Absolute or relative path to the CSV dataset file.

    Returns:
        pd.DataFrame: Loaded dataset as a pandas DataFrame.

    Raises:
        ImportError: If pandas is not yet installed in the active environment.
        FileNotFoundError: If the specified file does not exist.
    """
    if pd is None:
        raise ImportError(
            "pandas is required for data preprocessing. "
            "Please install backend dependencies: pip install -r backend/requirements.txt"
        )
    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Dataset file not found at: {file_path}. "
            f"Please place your dataset file inside the 'ml/dataset/' directory."
        )

    print(f"[Preprocessing] Loading dataset from: {file_path}")
    df = pd.read_csv(file_path)
    print(f"[Preprocessing] Loaded {len(df)} records with columns: {list(df.columns)}")
    return df


def clean_features(df: pd.DataFrame) -> pd.DataFrame:
    """Performs foundational data cleaning and missing value imputation.

    Args:
        df: Raw input DataFrame.

    Returns:
        pd.DataFrame: Cleaned DataFrame with handled missing values.
    """
    df_cleaned = df.copy()

    # TODO: Add domain-specific cleaning logic for your dataset.
    # For example:
    # 1. Strip whitespace from text columns.
    # 2. Filter out coordinates that fall outside the target metropolitan area.
    # 3. Handle missing lighting scores or incident frequencies with median imputation.

    print("[Preprocessing] Performing data cleaning...")
    # Drop pure duplicate rows if any exist
    df_cleaned = df_cleaned.drop_duplicates()

    return df_cleaned


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Generates safety-relevant features from raw spatial and temporal columns.

    Typical features for safe routing include:
    - time_of_day_risk: Higher risk assigned to late-night hours.
    - lighting_index: Ambient street lighting rating (0.0 to 1.0).
    - historical_incident_density: Kernel density of past reported incidents.
    - road_type_weight: Sidewalk vs. main road vs. alleyway.

    Args:
        df: Cleaned input DataFrame.

    Returns:
        pd.DataFrame: DataFrame enriched with engineered feature columns.
    """
    df_features = df.copy()

    # TODO: Implement feature engineering when dataset columns are finalized.
    # Example transformation pattern:
    # if "hour" in df_features.columns:
    #     df_features["is_night"] = df_features["hour"].apply(lambda h: 1 if h >= 21 or h <= 5 else 0)

    print("[Preprocessing] Feature engineering complete.")
    return df_features


def split_features_and_target(
    df: pd.DataFrame, target_column: str = "safety_score"
) -> Tuple[pd.DataFrame, pd.Series]:
    """Separates feature matrix (X) from the target label (y).

    Args:
        df: Preprocessed DataFrame containing features and target column.
        target_column: Column name representing the safety score or risk label.

    Returns:
        Tuple[pd.DataFrame, pd.Series]: (X_features, y_target)
    """
    if target_column not in df.columns:
        raise KeyError(
            f"Target column '{target_column}' not found in DataFrame. "
            f"Available columns are: {list(df.columns)}"
        )

    X = df.drop(columns=[target_column])
    y = df[target_column]

    return X, y
