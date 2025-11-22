"""Scaling Bridge (Agent 3)

Converts clean clinical features into scaled (0-1) values for ML model consumption.
Uses MinMax scaling based on physiological ranges.
"""
from __future__ import annotations

import json
from typing import Dict, Any, Optional

# Re-use ranges from DataQualityAgent for consistency
# In a real app, these might be shared in a config file
PHYSIO_RANGES = {
    "BMI": (8, 80), "Glucose": (30, 1000),
    "Systolic Blood Pressure": (50, 300), "Diastolic Blood Pressure": (30, 200),
    "Cholesterol": (50, 1000), "LDL Cholesterol": (10, 1000),
    "HDL Cholesterol": (5, 200), "Triglycerides": (5, 2000),
    "Hemoglobin": (3, 25), "Platelets": (1e3, 5e6),
    "White Blood Cells": (0.1, 200), "Red Blood Cells": (0.5, 10),
    "Hematocrit": (5, 80), "Mean Corpuscular Volume": (40, 150),
    "Mean Corpuscular Hemoglobin": (5, 50),
    "Mean Corpuscular Hemoglobin Concentration": (10, 50),
    "HbA1c": (3.0, 25.0), "Troponin": (0.0, 100.0),
    "ALT": (1, 2000), "AST": (1, 2000),
    "Creatinine": (0.01, 50), "C-reactive Protein": (0.0, 500.0),
    "Insulin": (0, 1000), "Heart Rate": (30, 250),
}

class ScalingBridge:
    """Scales features to [0, 1] range."""

    def scale_features(self, clean_features: Dict[str, Any]) -> Dict[str, Any]:
        scaled_features = {}
        
        # Mapping from snake_case (DataQualityAgent) to Title Case (Model)
        key_map = {
            "bmi": "BMI", "glucose": "Glucose",
            "systolic_blood_pressure": "Systolic Blood Pressure",
            "diastolic_blood_pressure": "Diastolic Blood Pressure",
            "cholesterol": "Cholesterol", "ldl_cholesterol": "LDL Cholesterol",
            "hdl_cholesterol": "HDL Cholesterol", "triglycerides": "Triglycerides",
            "hemoglobin": "Hemoglobin", "platelets": "Platelets",
            "white_blood_cells": "White Blood Cells", "red_blood_cells": "Red Blood Cells",
            "hematocrit": "Hematocrit", "mean_corpuscular_volume": "Mean Corpuscular Volume",
            "mean_corpuscular_hemoglobin": "Mean Corpuscular Hemoglobin",
            "mean_corpuscular_hemoglobin_concentration": "Mean Corpuscular Hemoglobin Concentration",
            "hba1c": "HbA1c", "troponin": "Troponin",
            "alt": "ALT", "ast": "AST",
            "creatinine": "Creatinine", "c_reactive_protein": "C-reactive Protein",
            "insulin": "Insulin", "heart_rate": "Heart Rate"
        }

        for key, value in clean_features.items():
            if value is None or not isinstance(value, (int, float)):
                # Try to map key even if value is missing, set to 0.0
                target_key = key_map.get(key, key)
                scaled_features[target_key] = 0.0 
                continue

            # MinMax Scale
            target_key = key_map.get(key, key)
            rng = PHYSIO_RANGES.get(target_key)
            
            if rng:
                min_val, max_val = rng
                # Clip to range
                val = max(min_val, min(value, max_val))
                # Scale
                scaled = (val - min_val) / (max_val - min_val)
                scaled_features[target_key] = round(scaled, 4)
            else:
                scaled_features[target_key] = value # Pass through if no range

        return {"scaled_features": scaled_features}

if __name__ == "__main__":
    bridge = ScalingBridge()
    sample = {"bmi": 22.5, "glucose": 160, "insulin": 15, "heart_rate": 75}
    print(json.dumps(bridge.scale_features(sample), indent=2))
