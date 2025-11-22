"""Intake & Extraction Agent

This module implements the IntakeExtractionAgent which extracts 24 canonical
clinical features from either free-text input or PDF lab reports. It uses 
Google Gemini API for NER and normalization, with robust regex fallbacks.

Requirements:
- pdfplumber for PDF parsing
- google-generativeai
"""
from __future__ import annotations

import re
import json
import os
import logging
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    import pdfplumber
except Exception:
    pdfplumber = None

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Canonical feature list (24 fields)
CANONICAL_FEATURES = [
    "age", "sex", "bmi", "glucose", "blood_pressure_systolic",
    "blood_pressure_diastolic", "cholesterol_total", "ldl_cholesterol",
    "hdl_cholesterol", "triglycerides", "hemoglobin", "platelets",
    "white_blood_cells", "red_blood_cells", "hematocrit",
    "mean_corpuscular_volume", "mean_corpuscular_hemoglobin",
    "mean_corpuscular_hemoglobin_concentration", "hba1c", "troponin",
    "alt", "ast", "creatinine", "c_reactive_protein",
]

# Fields considered critical
CRITICAL_FIELDS = ["age", "sex", "glucose", "blood_pressure_systolic", "blood_pressure_diastolic", "cholesterol_total"]

# Synonym dictionaries
SYNONYMS = {
    "glucose": "glucose", "blood sugar": "glucose", "fbs": "glucose",
    "bp": "blood_pressure_systolic", "systolic": "blood_pressure_systolic",
    "diastolic": "blood_pressure_diastolic", "hemoglobin": "hemoglobin",
    "hb": "hemoglobin", "cholesterol": "cholesterol_total",
    "total cholesterol": "cholesterol_total", "ldl": "ldl_cholesterol",
    "hdl": "hdl_cholesterol", "triglycerides": "triglycerides",
    "tsh": "tsh", "troponin": "troponin", "crp": "c_reactive_protein",
    "alt": "alt", "ast": "ast", "creatinine": "creatinine",
    "platelets": "platelets", "wbc": "white_blood_cells",
    "rbc": "red_blood_cells", "hematocrit": "hematocrit",
    "mcv": "mean_corpuscular_volume", "mch": "mean_corpuscular_hemoglobin",
    "mchc": "mean_corpuscular_hemoglobin_concentration"
}

def _clean_number(text: str) -> Optional[float]:
    """Try to parse a numeric value from text."""
    if text is None: return None
    t = str(text).strip()
    t = re.sub(r"[,\s]*(mg/dL|mg/dl|ng/mL|mmol/L|g/dL|x10\^9/L|/L|%)", "", t, flags=re.IGNORECASE)
    t = t.replace(',', '')
    m = re.search(r"-?\d+\.?\d*", t)
    return float(m.group(0)) if m else None

def regex_extract_all(text: str) -> Dict[str, Any]:
    """Run regex patterns to extract likely lab values."""
    text = text.replace('\u00A0', ' ').replace('\u2011', '-').replace('\u2013', '-')
    text = re.sub(r"\s+", " ", text)
    text_l = text.lower()
    results: Dict[str, Any] = {}

    # Regex patterns (simplified for brevity, covering key fields)
    patterns = {
        "glucose": [r"(glucose|blood sugar|fbs).*?(\d+\.?\d*)"],
        "hba1c": [r"(hba1c|a1c).*?(\d+\.?\d*)"],
        "troponin": [r"(troponin).*?(\d+\.?\d*)"],
        "cholesterol_total": [r"(total cholesterol).*?(\d+\.?\d*)"],
        "ldl_cholesterol": [r"(ldl).*?(\d+\.?\d*)"],
        "hdl_cholesterol": [r"(hdl).*?(\d+\.?\d*)"],
        "triglycerides": [r"(triglycerides|tg).*?(\d+\.?\d*)"],
        "hemoglobin": [r"\b(hemoglobin|hb)\b.*?(\d+\.?\d*)"],
        "platelets": [r"(platelet).*?(\d+\.?\d*)"],
        "white_blood_cells": [r"(wbc|white blood).*?(\d+\.?\d*)"],
        "red_blood_cells": [r"(rbc|red blood).*?(\d+\.?\d*)"],
        "creatinine": [r"(creatinine).*?(\d+\.?\d*)"],
        "alt": [r"\b(alt)\b.*?(\d+\.?\d*)"],
        "ast": [r"\b(ast)\b.*?(\d+\.?\d*)"],
        "bmi": [r"(bmi).*?(\d+\.?\d*)"],
        "age": [r"(\d{1,3}).*?(year|old|age)"],
    }

    for key, pats in patterns.items():
        for pat in pats:
            m = re.search(pat, text_l)
            if m:
                val = _clean_number(m.group(2))
                if val is not None: results[key] = val

    # BP Special Case
    m = re.search(r"(\d{2,3})\s*\/\s*(\d{2,3})", text_l)
    if m:
        results["blood_pressure_systolic"] = _clean_number(m.group(1))
        results["blood_pressure_diastolic"] = _clean_number(m.group(2))

    # Sex
    if re.search(r"\b(male|man|m)\b", text_l): results["sex"] = "male"
    elif re.search(r"\b(female|woman|f)\b", text_l): results["sex"] = "female"

    return results

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using pdfplumber."""
    if pdfplumber is None:
        raise RuntimeError("pdfplumber not installed.")
    text_parts = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text_parts.append(page.extract_text() or "")
                for table in page.extract_tables():
                    for row in table:
                        text_parts.append(" ".join([str(c) for c in row if c]))
    except Exception as e:
        logger.error(f"PDF read error: {e}")
        return ""
    return "\n".join(text_parts)

class IntakeExtractionAgent:
    """Agent that extracts structured clinical features using Gemini."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
            logger.warning("No GEMINI_API_KEY found. Using regex fallback only.")

    def extract_from_text(self, raw_text: str) -> Dict[str, Any]:
        """Extract features from raw text using Gemini + Regex."""
        mode = "RAW_TEXT_MODE"
        cleaned = raw_text.strip()
        extracted = {}

        if self.model:
            prompt = (
                "Extract clinical parameters from the text below and return a JSON object. "
                "Keys MUST be: age, sex, bmi, glucose, blood_pressure_systolic, blood_pressure_diastolic, "
                "cholesterol_total, ldl_cholesterol, hdl_cholesterol, triglycerides, hemoglobin, platelets, "
                "white_blood_cells, red_blood_cells, hematocrit, mean_corpuscular_volume, "
                "mean_corpuscular_hemoglobin, mean_corpuscular_hemoglobin_concentration, hba1c, troponin, "
                "alt, ast, creatinine, c_reactive_protein. "
                "If a value is not found, exclude the key. Return ONLY JSON.\n\n"
                f"Text: {cleaned}"
            )
            try:
                response = self.model.generate_content(prompt)
                text_resp = response.text
                # Clean markdown code blocks if present
                if "```json" in text_resp:
                    text_resp = text_resp.split("```json")[1].split("```")[0]
                elif "```" in text_resp:
                    text_resp = text_resp.split("```")[1].split("```")[0]
                
                extracted = json.loads(text_resp)
                # Normalize keys and values
                extracted = {k.lower(): v for k, v in extracted.items()}
            except Exception as e:
                logger.error(f"Gemini extraction failed: {e}")

        # Regex Fallback & Merge
        regex_results = regex_extract_all(cleaned)
        for k, v in regex_results.items():
            if k not in extracted or extracted[k] is None:
                extracted[k] = v

        return {"mode": mode, "raw_extraction": extracted}

    def extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract features from PDF."""
        text = extract_text_from_pdf(pdf_path)
        result = self.extract_from_text(text)
        result["mode"] = "PDF_MODE"
        return result

    def unify_features(self, extraction_result: Dict[str, Any]) -> Dict[str, Any]:
        """Unify extracted data into canonical format."""
        raw = extraction_result.get("raw_extraction", {})
        features = {k: None for k in CANONICAL_FEATURES}
        warnings = []

        for k, v in raw.items():
            # Handle BP composite
            if k in ["blood_pressure", "bp"] and isinstance(v, str) and "/" in v:
                parts = v.split("/")
                features["blood_pressure_systolic"] = _clean_number(parts[0])
                features["blood_pressure_diastolic"] = _clean_number(parts[1])
                continue

            # Map synonyms
            canon = SYNONYMS.get(k, k)
            if canon in features:
                if canon == "sex":
                    features[canon] = v.lower() if isinstance(v, str) else v
                else:
                    features[canon] = _clean_number(v) if isinstance(v, str) else v

        # Missing check
        missing = [f for f in CRITICAL_FIELDS if features.get(f) is None]
        if missing:
            warnings.append(f"Missing critical fields: {missing}")

        return {
            "features": features,
            "missing_fields": missing,
            "warnings": warnings,
            "mode": extraction_result.get("mode")
        }

if __name__ == "__main__":
    agent = IntakeExtractionAgent()
    text = "Patient is a 45 year old male. BP 120/80. Glucose 110."
    print(json.dumps(agent.unify_features(agent.extract_from_text(text)), indent=2))