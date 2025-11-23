"""Data Quality & Validation Agent (Agent 2)

Receives a dictionary of raw clinical features (from Agent 1) and performs:
- physiological range checks
- dataset-range checks
- missing value detection
- critical outlier detection
- optional Gemini-driven clarification/repair for critical outliers

Output is a cleaned feature dict and a data quality report.
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Dict, Any, Tuple, List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Canonical 24 features
CANONICAL_FEATURES = [
    "glucose", "cholesterol", "hemoglobin", "platelets", "white_blood_cells",
    "red_blood_cells", "hematocrit", "mean_corpuscular_volume",
    "mean_corpuscular_hemoglobin", "mean_corpuscular_hemoglobin_concentration",
    "insulin", "bmi", "systolic_blood_pressure", "diastolic_blood_pressure",
    "triglycerides", "hba1c", "ldl_cholesterol", "hdl_cholesterol",
    "alt", "ast", "heart_rate", "creatinine", "troponin", "c_reactive_protein",
]

# Physiological ranges
PHYSIO_RANGES: Dict[str, Tuple[float, float]] = {
    "bmi": (8, 80), "glucose": (30, 1000),
    "systolic_blood_pressure": (50, 300), "diastolic_blood_pressure": (30, 200),
    "cholesterol": (50, 1000), "ldl_cholesterol": (10, 1000),
    "hdl_cholesterol": (5, 200), "triglycerides": (5, 2000),
    "hemoglobin": (3, 25), "platelets": (1e3, 5e6),
    "white_blood_cells": (0.1, 200), "red_blood_cells": (0.5, 10),
    "hematocrit": (5, 80), "mean_corpuscular_volume": (40, 150),
    "mean_corpuscular_hemoglobin": (5, 50),
    "mean_corpuscular_hemoglobin_concentration": (10, 50),
    "hba1c": (3.0, 25.0), "troponin": (0.0, 100.0),
    "alt": (1, 2000), "ast": (1, 2000),
    "creatinine": (0.01, 50), "c_reactive_protein": (0.0, 500.0),
    "insulin": (0, 1000), "heart_rate": (30, 250),
}

# Dataset ranges (narrower)
DATASET_RANGES: Dict[str, Tuple[float, float]] = {
    "bmi": (8, 80), "glucose": (30, 1000),
    "systolic_blood_pressure": (50, 300), "diastolic_blood_pressure": (30, 200),
    "cholesterol": (50, 1000), "ldl_cholesterol": (10, 1000),
    "hdl_cholesterol": (5, 200), "triglycerides": (5, 2000),
    "hemoglobin": (3, 25), "platelets": (1e3, 5e6),
    "white_blood_cells": (0.1, 200), "red_blood_cells": (0.5, 10),
    "hematocrit": (5, 80), "mean_corpuscular_volume": (40, 150),
    "mean_corpuscular_hemoglobin": (5, 50),
    "mean_corpuscular_hemoglobin_concentration": (10, 50),
    "hba1c": (3.0, 25.0), "troponin": (0.0, 100.0),
    "alt": (1, 2000), "ast": (1, 2000),
    "creatinine": (0.01, 50), "c_reactive_protein": (0.0, 500.0),
    "insulin": (0, 1000), "heart_rate": (30, 250),
}

def _to_number(value: Any) -> Optional[float]:
    if value is None: return None
    if isinstance(value, (int, float)): return float(value)
    try:
        s = str(value).strip()
        s = re.sub(r"[,\s]*(mg/dL|mg/dl|mmol/L|g/dL|%)", "", s, flags=re.IGNORECASE)
        m = re.search(r"-?\d+\.?\d*", s)
        return float(m.group(0)) if m else None
    except: return None

def _is_within_range(value: float, rng: Tuple[float, float]) -> bool:
    return rng[0] <= value <= rng[1]

def parse_gemini_fix(response: str) -> Optional[float]:
    """Extract numeric suggestion from Gemini response."""
    if not response: return None
    # Range
    r = re.search(r"([0-9]+\.?[0-9]*)\s*[-to]{1,3}\s*([0-9]+\.?[0-9]*)", response)
    if r: return (float(r.group(1)) + float(r.group(2))) / 2.0
    # Single number
    m = re.search(r"-?\d+\.?\d*", response)
    return float(m.group(0)) if m else None

class DataQualityAgent:
    """Validate and repair clinical features using rules and Gemini."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def detect_anomalous_patterns(self, raw_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect unrealistic input patterns that suggest data quality issues.
        
        Returns:
            Dict with 'is_anomalous' (bool), 'anomaly_type' (str), and 'anomaly_score' (float)
        """
        numeric_values = []
        total_features = len(CANONICAL_FEATURES)
        provided_features = 0
        
        for feat in CANONICAL_FEATURES:
            raw_val = raw_features.get(feat)
            num = _to_number(raw_val)
            if num is not None:
                numeric_values.append(num)
                provided_features += 1
        
        # Check 1: Too few features provided (< 30%)
        if provided_features < total_features * 0.3:
            return {
                "is_anomalous": True,
                "anomaly_type": "insufficient_data",
                "anomaly_score": 0.9,
                "message": f"Only {provided_features}/{total_features} features provided. Need at least {int(total_features * 0.3)} for reliable prediction."
            }
        
        # Check 2: All values are exactly the same
        if len(numeric_values) >= 3:
            unique_values = set(numeric_values)
            if len(unique_values) == 1:
                return {
                    "is_anomalous": True,
                    "anomaly_type": "all_identical",
                    "anomaly_score": 1.0,
                    "message": f"All {len(numeric_values)} numeric values are identical ({numeric_values[0]}). This is highly unrealistic for clinical data."
                }
            
            # Check 3: Values are suspiciously uniform (low variance)
            if len(numeric_values) >= 5:
                mean_val = sum(numeric_values) / len(numeric_values)
                variance = sum((x - mean_val) ** 2 for x in numeric_values) / len(numeric_values)
                std_dev = variance ** 0.5
                coefficient_of_variation = std_dev / mean_val if mean_val > 0 else 0
                
                # If coefficient of variation is very low, data is suspiciously uniform
                if coefficient_of_variation < 0.05:  # Less than 5% variation
                    return {
                        "is_anomalous": True,
                        "anomaly_type": "suspiciously_uniform",
                        "anomaly_score": 0.8,
                        "message": f"Values show unusually low variation (CV={coefficient_of_variation:.3f}). Clinical vitals typically vary more."
                    }
        
        # Check 4: Too many round numbers (potential manual fabrication)
        if len(numeric_values) >= 5:
            round_count = sum(1 for v in numeric_values if v == int(v))
            round_percentage = round_count / len(numeric_values)
            if round_percentage > 0.9:  # More than 90% are round numbers
                return {
                    "is_anomalous": True,
                    "anomaly_type": "too_many_round_numbers",
                    "anomaly_score": 0.6,
                    "message": f"{round_percentage*100:.0f}% of values are round numbers. Real clinical data usually has more decimal precision."
                }
        
        # No anomalies detected
        return {
            "is_anomalous": False,
            "anomaly_type": None,
            "anomaly_score": 0.0,
            "message": "Input pattern appears normal."
        }

    def validate(self, raw_features: Dict[str, Any]) -> Dict[str, Any]:
        clean_features = {k: None for k in CANONICAL_FEATURES}
        missing_fields = []
        critical_outliers = []
        dataset_outliers = []
        warnings = []
        gemini_corrections = {}

        for feat in CANONICAL_FEATURES:
            raw_val = raw_features.get(feat)
            num = _to_number(raw_val)

            # Missing
            if raw_val is None or (isinstance(raw_val, str) and not raw_val.strip()):
                missing_fields.append(feat)
                continue



            # Not numeric
            if num is None:
                missing_fields.append(feat)
                continue

            # Physio Range Check
            phys_range = PHYSIO_RANGES.get(feat)
            ds_range = DATASET_RANGES.get(feat)

            if phys_range and not _is_within_range(num, phys_range):
                critical_outliers.append((feat, num))
                # Ask Gemini
                if self.model:
                    prompt = (
                        f"Value for {feat} = {num} appears outside human physiology range {phys_range}. "
                        "Is this likely a typo? If so, suggest a corrected numeric value. "
                        "Return ONLY the corrected number or range. If unsure, say 'None'."
                    )
                    try:
                        resp = self.model.generate_content(prompt)
                        suggestion = parse_gemini_fix(resp.text)
                        if suggestion:
                            clean_features[feat] = suggestion
                            gemini_corrections[feat] = suggestion
                        else:
                            clean_features[feat] = None
                    except Exception as e:
                        logger.error(f"Gemini validation failed: {e}")
                        clean_features[feat] = None
                else:
                    clean_features[feat] = None
                continue

            # Dataset Range Check
            if ds_range and not _is_within_range(num, ds_range):
                dataset_outliers.append((feat, num))
                warnings.append(f"{feat}={num} is outside typical dataset range {ds_range}")

            clean_features[feat] = num

        report = {
            "missing_fields": missing_fields,
            "critical_outliers": critical_outliers,
            "dataset_outliers": dataset_outliers,
            "warnings": warnings,
            "gemini_corrections": gemini_corrections,
        }

        return {"clean_features": clean_features, "data_quality_report": report}

if __name__ == "__main__":
    agent = DataQualityAgent()
    sample = {"bmi": 22, "glucose": 160, "systolic_blood_pressure": 120}
    print(json.dumps(agent.validate(sample), indent=2))
