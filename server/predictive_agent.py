"""Predictive Health Agent (Agent 4)

This agent uses Google Gemini to analyze current clinical features and generate
predictive insights, focusing on:
1. Persistence Risks: Consequences of maintaining current habits.
2. Improvement Gains: Benefits of positive lifestyle changes.
3. Novel Insights: Unique patterns or correlations not immediately obvious.
"""
import os
import json
import logging
from typing import Dict, Any, List
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class PredictiveAgent:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            logger.warning("No GEMINI_API_KEY found. Predictive capabilities disabled.")

    def generate_predictions(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Generate predictive insights based on clinical features."""
        if not self.model:
            return self._get_mock_predictions()

        # Filter out None values for cleaner prompt
        active_features = {k: v for k, v in features.items() if v is not None}
        
        prompt = (
            "Act as an advanced medical AI. Analyze the following patient vitals and generate a predictive report. "
            "Return ONLY a JSON object with the following structure:\n"
            "{\n"
            "  'persistence_risks': [{'condition': 'string', 'probability': 'int (0-100)', 'impact': 'string', 'timeframe': 'string'}],\n"
            "  'improvement_gains': [{'habit': 'string', 'benefit': 'string', 'health_score_increase': 'int (0-100)', 'timeframe': 'string'}],\n"
            "  'novel_insights': [{'title': 'string', 'description': 'string', 'type': 'warning|success|neutral'}]\n"
            "}\n\n"
            f"Patient Data: {json.dumps(active_features)}\n"
            "Focus on realistic medical consequences. Be specific."
        )

        try:
            response = self.model.generate_content(prompt)
            text_resp = response.text
            
            # Clean markdown code blocks
            if "```json" in text_resp:
                text_resp = text_resp.split("```json")[1].split("```")[0]
            elif "```" in text_resp:
                text_resp = text_resp.split("```")[1].split("```")[0]
                
            return json.loads(text_resp)

        except Exception as e:
            logger.error(f"Predictive analysis failed: {e}")
            return self._get_mock_predictions()

    def _get_mock_predictions(self) -> Dict[str, Any]:
        """Fallback mock data if API fails."""
        return {
            "persistence_risks": [
                {"condition": "Hypertension", "probability": 45, "impact": "Increased strain on heart", "timeframe": "5 years"},
                {"condition": "Metabolic Syndrome", "probability": 30, "impact": "Insulin resistance", "timeframe": "3 years"}
            ],
            "improvement_gains": [
                {"habit": "Reduce Sodium Intake", "benefit": "Lower Blood Pressure", "health_score_increase": 15, "timeframe": "3 months"},
                {"habit": "30min Daily Cardio", "benefit": "Improved Heart Health", "health_score_increase": 20, "timeframe": "6 months"}
            ],
            "novel_insights": [
                {"title": "Circadian Rhythm", "description": "Your vitals suggest irregular sleep patterns affecting recovery.", "type": "warning"}
            ]
        }
