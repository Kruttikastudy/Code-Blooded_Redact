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
    "bmi": (12, 55), "glucose": (60, 400),
    "systolic_blood_pressure": (80, 220), "diastolic_blood_pressure": (40, 140),
    "cholesterol": (100, 400), "ldl_cholesterol": (20, 300),
    "hdl_cholesterol": (20, 120), "triglycerides": (20, 800),
    "hemoglobin": (6, 20), "platelets": (5e3, 1e6),
    "white_blood_cells": (1.0, 50.0), "red_blood_cells": (2.5, 7.5),
    "hematocrit": (20, 60), "mean_corpuscular_volume": (60, 120),
    "mean_corpuscular_hemoglobin": (15, 40),
    "mean_corpuscular_hemoglobin_concentration": (20, 38),
    "hba1c": (4.0, 15.0), "troponin": (0.0, 2.0),
    "alt": (5, 300), "ast": (5, 300),
    "creatinine": (0.2, 10), "c_reactive_protein": (0.0, 200.0),
    "insulin": (2, 50), "heart_rate": (40, 120),
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
