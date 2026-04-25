"""
ml_pipeline.py — Shadow Economy ML Pipeline.

Stages:
  1. Feature normalization (Min-Max)
  2. Shadow Economy Index Score (PCA-derived weights)
  3. Isolation Forest anomaly detection
  4. K-Means archetype clustering with post-hoc centroid labeling
  5. Confidence scoring via signal agreement
"""

import json
import os
from typing import List, Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans

FEATURE_COLS = ["light_score", "registered_density", "population_density", "mobility_score"]

# PRD default weights (fallback)
DEFAULT_WEIGHTS = {
    "light_score": 0.35,
    "population_density": 0.30,
    "mobility_score": 0.15,
    "registered_density": -0.40,  # negative = formal presence suppresses score
}

ARCHETYPE_COLORS = {
    "Shadow Economy Zone": "#ff4444",
    "Formal Urban Hub": "#4488ff",
    "Residential Dense": "#44bb88",
    "Transit Corridor": "#ffaa33",
    "Normal": "#666666",
}


def normalize_features(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 1: Min-Max normalize features to [0, 1]."""
    scaler = MinMaxScaler()
    df[FEATURE_COLS] = scaler.fit_transform(df[FEATURE_COLS])
    return df


def derive_weights_pca(df: pd.DataFrame) -> Dict[str, float]:
    """
    Derive signal importance weights via PCA on the feature matrix.
    Uses absolute values of PC1 loadings as weights.
    Inverts weight for registered_density (formal presence suppresses shadow score).
    Falls back to PRD defaults if PCA gives degenerate results.
    """
    try:
        pca = PCA(n_components=1, random_state=42)
        pca.fit(df[FEATURE_COLS].values)
        loadings = pca.components_[0]

        # Use absolute loadings as raw weights
        abs_loadings = np.abs(loadings)
        total = abs_loadings.sum()

        if total < 1e-6:
            print("PCA gave degenerate results, using default weights")
            return DEFAULT_WEIGHTS

        # Normalize to sum to ~1.2 (matching PRD total: 0.35+0.30+0.15+0.40=1.20)
        normalized = abs_loadings / total * 1.20

        weights = {}
        for i, col in enumerate(FEATURE_COLS):
            if col == "registered_density":
                weights[col] = -normalized[i]  # invert: formal suppresses shadow
            else:
                weights[col] = normalized[i]

        print(f"PCA-derived weights: {weights}")
        return weights

    except Exception as e:
        print(f"PCA failed ({e}), using default weights")
        return DEFAULT_WEIGHTS


def compute_shadow_score(df: pd.DataFrame, weights: Dict[str, float]) -> pd.DataFrame:
    """Stage 2: Compute weighted Shadow Economy Index Score."""
    df["shadow_score"] = 0.0
    for col, weight in weights.items():
        df["shadow_score"] += weight * df[col]

    # Clip to [0, 1]
    df["shadow_score"] = df["shadow_score"].clip(0, 1)
    return df


def run_isolation_forest(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 3: Isolation Forest anomaly detection."""
    iso = IsolationForest(
        contamination=0.15,
        random_state=42,
        n_estimators=200,
    )
    feature_matrix = df[FEATURE_COLS].values

    df["anomaly_flag"] = iso.fit_predict(feature_matrix)
    df["anomaly_score"] = -iso.decision_function(feature_matrix)  # higher = more anomalous

    # Normalize anomaly_score to [0, 1]
    a_min = df["anomaly_score"].min()
    a_max = df["anomaly_score"].max()
    if a_max > a_min:
        df["anomaly_score"] = (df["anomaly_score"] - a_min) / (a_max - a_min)
    else:
        df["anomaly_score"] = 0.0

    n_anomalous = (df["anomaly_flag"] == -1).sum()
    print(f"Isolation Forest: {n_anomalous} anomalous cells out of {len(df)}")
    return df


def label_archetype(centroid: np.ndarray) -> str:
    """
    Post-hoc archetype labeling based on centroid feature values.
    Feature order: light_score, registered_density, population_density, mobility_score
    """
    light, formal, pop, mobility = centroid

    if light > 0.6 and pop > 0.5 and formal < 0.3:
        return "Shadow Economy Zone"
    elif formal > 0.5 and light > 0.5:
        return "Formal Urban Hub"
    elif pop > 0.5 and formal < 0.4 and mobility < 0.4:
        return "Residential Dense"
    else:
        return "Transit Corridor"


def run_kmeans_clustering(df: pd.DataFrame) -> pd.DataFrame:
    """Stage 4: K-Means clustering on anomalous cells with post-hoc labeling."""
    # Initialize archetype column
    df["archetype"] = "Normal"
    df["cluster_id"] = -1

    anomalous_mask = df["anomaly_flag"] == -1
    anomalous_df = df[anomalous_mask]

    if len(anomalous_df) < 4:
        print("Too few anomalous cells for K-Means, skipping clustering")
        return df

    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(anomalous_df[FEATURE_COLS].values)
    df.loc[anomalous_mask, "cluster_id"] = clusters

    # Post-hoc labeling via centroid inspection
    archetype_map = {}
    assigned_labels = set()

    # Score each cluster by how well it fits each archetype
    for cluster_id, centroid in enumerate(kmeans.cluster_centers_):
        label = label_archetype(centroid)
        # Handle duplicate labels — disambiguate by finding best unique assignment
        if label in assigned_labels:
            # Try alternative labels
            candidates = ["Shadow Economy Zone", "Formal Urban Hub", "Residential Dense", "Transit Corridor"]
            for candidate in candidates:
                if candidate not in assigned_labels:
                    label = candidate
                    break
        archetype_map[cluster_id] = label
        assigned_labels.add(label)

    # Apply labels
    for cluster_id, label in archetype_map.items():
        mask = (df["anomaly_flag"] == -1) & (df["cluster_id"] == cluster_id)
        df.loc[mask, "archetype"] = label

    print(f"Archetype mapping: {archetype_map}")
    print(f"Archetype distribution:")
    print(df["archetype"].value_counts().to_string())
    return df


def compute_confidence(row: pd.Series) -> str:
    """
    Stage 5: Count how many signals agree with informal economy pattern.
    3+ signals agreeing = High, 2 = Medium, <2 = Low
    """
    agreeing = 0
    if row["light_score"] > 0.5:
        agreeing += 1  # high activity indicator
    if row["population_density"] > 0.5:
        agreeing += 1  # people are present
    if row["registered_density"] < 0.3:
        agreeing += 1  # low formal business presence
    if row["mobility_score"] > 0.4:
        agreeing += 1  # area is accessible

    if agreeing >= 3:
        return "high"
    elif agreeing == 2:
        return "medium"
    else:
        return "low"


def compute_informal_probability(df):
    # Base from anomaly score
    df["informal_probability"] = df["anomaly_score"] * 0.7

    # Archetype boosts
    df.loc[df["archetype"] == "Shadow Economy Zone", "informal_probability"] += 0.25
    df.loc[(df["anomaly_flag"] == -1) & (df["archetype"] != "Shadow Economy Zone"), "informal_probability"] += 0.10

    # DIRECT PENALTY for high formal business presence
    # High OSM business = less likely to be informal
    df["informal_probability"] -= df["registered_density"] * 0.30

    # Clip and round
    df["informal_probability"] = df["informal_probability"].clip(0, 1).round(4)
    return df


def run_pipeline(cells: List[Dict]) -> List[Dict]:
    """Run the complete ML pipeline on raw cell data."""
    print("=" * 60)
    print("SHADOW ECONOMY ML PIPELINE")
    print("=" * 60)

    df = pd.DataFrame(cells)

    # Stage 1: Normalize
    print("\n-- Stage 1: Feature Normalization --")
    df = normalize_features(df)

    # Stage 2: PCA weights + shadow score
    print("\n-- Stage 2: Shadow Economy Index Score (PCA weights) --")
    weights = derive_weights_pca(df)
    df = compute_shadow_score(df, weights)
    print(f"Shadow score: min={df['shadow_score'].min():.3f} max={df['shadow_score'].max():.3f} "
          f"mean={df['shadow_score'].mean():.3f}")

    # Stage 3: Isolation Forest
    print("\n-- Stage 3: Isolation Forest --")
    df = run_isolation_forest(df)

    # Stage 4: K-Means clustering
    print("\n-- Stage 4: K-Means Archetype Clustering --")
    df = run_kmeans_clustering(df)

    # Stage 5: Confidence + informal probability
    print("\n-- Stage 5: Confidence & Informal Probability --")
    df["confidence"] = df.apply(compute_confidence, axis=1)
    df = compute_informal_probability(df)
    print(f"Confidence distribution:")
    print(df["confidence"].value_counts().to_string())

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)

    # Convert back to list of dicts
    result = df.to_dict(orient="records")

    # Round float fields
    for cell in result:
        for key in ["light_score", "registered_density", "population_density",
                     "mobility_score", "shadow_score", "anomaly_score"]:
            if key in cell:
                cell[key] = round(float(cell[key]), 4)
        cell["anomaly_flag"] = int(cell["anomaly_flag"])
        cell["cluster_id"] = int(cell["cluster_id"])

    return result


def save_processed(cells: List[Dict], output_path: str = None):
    """Save processed cells to JSON."""
    if output_path is None:
        output_path = os.path.join(os.path.dirname(__file__), "data", "processed_cells.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(cells, f, indent=2)
    print(f"Saved processed data to {output_path}")


if __name__ == "__main__":
    from data_loader import load_real_data
    raw_cells = load_real_data()
    processed = run_pipeline(raw_cells)
    save_processed(processed)
