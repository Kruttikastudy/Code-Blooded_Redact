from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import hashlib
import datetime
import logging
import os
from dotenv import load_dotenv
import joblib
from scipy.special import expit
import pandas as pd
from sqlmodel import Session, select
from passlib.context import CryptContext

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATBOOST_MODEL_PATH = os.path.join(BASE_DIR, "mediguard_catboost.pkl")
catboost_model = joblib.load(CATBOOST_MODEL_PATH)

LABEL_MAP = {0: 'Anemia', 1: 'Diabetes', 2: 'Healthy', 3: 'Thalasse', 4: 'Thromboc'}

# Import Agents
from intake_extraction_agent import IntakeExtractionAgent
from data_quality_agent import DataQualityAgent
from scaling_bridge import ScalingBridge
from predictive_agent import PredictiveAgent

# Import Database
from database import create_db_and_tables, get_session
from models import PatientReport, User

load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MediGuard-Server")

app = FastAPI(title="MediGuard API")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Startup: Create database tables
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    logger.info("Database tables created successfully")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agents
intake_agent = IntakeExtractionAgent()
quality_agent = DataQualityAgent()
scaling_bridge = ScalingBridge()
predictive_agent = PredictiveAgent()

# Blockchain Simulation
BLOCKCHAIN_FILE = "blockchain.json"

def load_blockchain():
    try:
        with open(BLOCKCHAIN_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def append_to_blockchain(data: dict):
    chain = load_blockchain()
    prev_hash = chain[-1]["hash"] if chain else "0" * 64
    
    block = {
        "index": len(chain) + 1,
        "timestamp": datetime.datetime.now().isoformat(),
        "data": data,
        "prev_hash": prev_hash,
        "hash": hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    }
    
    chain.append(block)
    with open(BLOCKCHAIN_FILE, "w") as f:
        json.dump(chain, f, indent=2)
    
    return block

# Models
class AnalysisRequest(BaseModel):
    text: str
    file_name: Optional[str] = None
    mode: Optional[str] = "text" # 'text' or 'pdf'

class PredictionRequest(BaseModel):
    features: Dict[str, Any]

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# Endpoints
@app.get("/")
def read_root():
    return {"status": "MediGuard System Operational", "agents": ["Intake", "Quality", "Scaling", "Predictive"]}

@app.post("/api/auth/signup")
def signup(request: SignupRequest, session: Session = Depends(get_session)):
    """Create a new user account and store in Neon database."""
    logger.info(f"Signup request for email: {request.email}")
    
    try:
        # Check if email already exists
        existing_user = session.exec(select(User).where(User.email == request.email)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password (bcrypt has 72 byte limit, so truncate if needed)
        truncated_password = request.password[:72]
        hashed_password = pwd_context.hash(truncated_password)
        
        # Create new user in database
        new_user = User(
            name=request.name,
            email=request.email,
            hashed_password=hashed_password
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        logger.info(f"User created successfully: {new_user.id}")
        
        return {
            "success": True,
            "message": "Account created successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create account")

@app.post("/api/auth/login")
def login(request: LoginRequest, session: Session = Depends(get_session)):
    """Validate user credentials against Neon database."""
    logger.info(f"Login attempt for email: {request.email}")
    
    try:
        # Find user by email
        user = session.exec(select(User).where(User.email == request.email)).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not pwd_context.verify(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        logger.info(f"Login successful for user: {user.id}")
        
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/analyze")
def analyze_symptoms(request: AnalysisRequest, session: Session = Depends(get_session)):
    logger.info(f"Received analysis request. Mode: {request.mode}")
    
    try:
        # --- Step 1: Intake & Extraction (Agent 1) ---
        if request.mode == "pdf" and request.file_name:
            # In a real app, we'd handle file upload. Here we assume text is passed or path is known.
            # For this demo, we'll treat 'text' as the raw content extracted on client or passed directly.
            extraction_result = intake_agent.extract_from_text(request.text)
        else:
            extraction_result = intake_agent.extract_from_text(request.text)
            
        unified_data = intake_agent.unify_features(extraction_result)
        raw_features = unified_data["features"]
        
        logger.info(f"Received text from frontend: {request.text[:500]}")
        logger.info(f"Raw extracted features: {raw_features}")
        
        # KEY MAPPING FIX: Translate IntakeExtractionAgent keys to DataQualityAgent keys
        key_mapping = {
            "blood_pressure_systolic": "systolic_blood_pressure",
            "blood_pressure_diastolic": "diastolic_blood_pressure",
            "cholesterol_total": "cholesterol",
            "age": None,  # Remove age and sex as they're not in the model
            "sex": None
        }
        
        mapped_features = {}
        for key, value in raw_features.items():
            if key in key_mapping:
                new_key = key_mapping[key]
                if new_key is not None:  # Skip None mappings (age, sex)
                    mapped_features[new_key] = value
            else:
                mapped_features[key] = value
        
        logger.info(f"Mapped features: {mapped_features}")
        
        # --- Step 2: Data Quality & Validation (Agent 2) ---
        validation_result = quality_agent.validate(mapped_features)
        clean_features = validation_result["clean_features"]
        quality_report = validation_result["data_quality_report"]
        
        logger.info(f"Clean features: {clean_features}")
        
        # --- Step 3: Scaling Bridge (Agent 3) ---
        scaling_result = scaling_bridge.scale_features(clean_features)
        scaled_features = scaling_result["scaled_features"]
        
        logger.info(f"Scaled features: {scaled_features}")
        
        # --- Step 4: Mock ML Prediction (Placeholder for real model) ---
        # Calculate a simple health score based on scaled features
        # Higher score = Better health (inverse of risk)
        # This is just a heuristic for demo purposes
        # --- Step 4: CatBoost ML Prediction ---

        # Convert scaled features to DataFrame (make sure the keys match training features)
        feature_order = [
            'Glucose','Cholesterol','Hemoglobin','Platelets','White Blood Cells',
            'Red Blood Cells','Hematocrit','Mean Corpuscular Volume','Mean Corpuscular Hemoglobin',
            'Mean Corpuscular Hemoglobin Concentration','Insulin','BMI','Systolic Blood Pressure',
            'Diastolic Blood Pressure','Triglycerides','HbA1c','LDL Cholesterol','HDL Cholesterol',
            'ALT','AST','Heart Rate','Creatinine','Troponin','C-reactive Protein'
        ]

        feature_key_map = {
            'Glucose': 'Glucose',
            'Cholesterol': 'Cholesterol',
            'Hemoglobin': 'Hemoglobin',
            'Platelets': 'Platelets',
            'White Blood Cells': 'White Blood Cells',
            'Red Blood Cells': 'Red Blood Cells',
            'Hematocrit': 'Hematocrit',
            'Mean Corpuscular Volume': 'Mean Corpuscular Volume',
            'Mean Corpuscular Hemoglobin': 'Mean Corpuscular Hemoglobin',
            'Mean Corpuscular Hemoglobin Concentration': 'Mean Corpuscular Hemoglobin Concentration',
            'Insulin': 'Insulin',
            'BMI': 'BMI',
            'Systolic Blood Pressure': 'Systolic Blood Pressure',
            'Diastolic Blood Pressure': 'Diastolic Blood Pressure',
            'Triglycerides': 'Triglycerides',
            'HbA1c': 'HbA1c',
            'LDL Cholesterol': 'LDL Cholesterol',
            'HDL Cholesterol': 'HDL Cholesterol',
            'ALT': 'ALT',
            'AST': 'AST',
            'Heart Rate': 'Heart Rate',
            'Creatinine': 'Creatinine',
            'Troponin': 'Troponin',
            'C-reactive Protein': 'C-reactive Protein'
        }

        # Build a single-row DataFrame
        input_df = pd.DataFrame([[scaled_features.get(feature_key_map[f], 0) for f in feature_order]], columns=feature_order)

        # Predict raw logits
        raw_logits = catboost_model.predict(input_df, prediction_type='RawFormulaVal')

        # Convert logits to independent probabilities
        predictions = {LABEL_MAP[c]: float(expit(raw_logits[0][c])) for c in range(len(LABEL_MAP))}

        # Optional: pick the highest probability class
        predicted_class = max(predictions, key=predictions.get)

        health_score = round(predictions.get('Healthy', 0) * 100)  # example: use 'Healthy' probability as score

        triage_category = "Green"
        if health_score < 60: triage_category = "Red"
        elif health_score < 80: triage_category = "Yellow"


        result = {
            "analysis": {
                "health_score": health_score,
                "triage_category": triage_category,
                "features": clean_features,
                "scaled_features": scaled_features,
                "quality_report": quality_report,
                "warnings": unified_data["warnings"] + quality_report["warnings"],
                "predictions": predictions,
                "predicted_class": predicted_class
            }
        }


        # --- Step 5: Blockchain Log ---
        log_entry = {
            "type": "ANALYSIS_RESULT",
            "timestamp": datetime.datetime.now().isoformat(),
            "health_score": health_score,
            "triage": triage_category,
            "features_hash": hashlib.md5(json.dumps(clean_features, sort_keys=True).encode()).hexdigest()
        }
        block = append_to_blockchain(log_entry)
        result["blockchain_log"] = block
        
        # --- Step 6: Save to Database ---
        db_report = PatientReport(
            patient_name=clean_features.get("name"),
            # age and sex removed from input

            health_score=health_score,
            triage_category=triage_category,
            predictions_json=json.dumps(predictions),  # Save disease predictions
            raw_text=request.text[:500],  # Store first 500 chars
            features_json=json.dumps(clean_features),
            warnings_json=json.dumps(unified_data["warnings"] + quality_report["warnings"]),
            blockchain_hash=block["hash"]
        )
        session.add(db_report)
        session.commit()
        session.refresh(db_report)
        
        result["report_id"] = db_report.id
        logger.info(f"Saved report to database with ID: {db_report.id}")
        
        return result

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/detailed-analysis")
def get_detailed_analysis(request: PredictionRequest):
    """Endpoint for the Detailed Predictive Report."""
    logger.info("Received detailed analysis request")
    try:
        predictions = predictive_agent.generate_predictions(request.features)
        return {"predictions": predictions}
    except Exception as e:
        logger.error(f"Detailed analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/blockchain")
def get_blockchain():
    return load_blockchain()

@app.get("/api/reports")
def get_reports(session: Session = Depends(get_session)):
    """Fetch all reports, ordered by most recent first."""
    logger.info("Fetching all reports")
    try:
        reports = session.exec(select(PatientReport).order_by(PatientReport.created_at.desc())).all()
        
        # Convert to dict format
        reports_list = []
        for report in reports:
            reports_list.append({
                "id": report.id,
                "report_title": report.report_title or f"Report #{report.id}",
                "health_score": report.health_score,
                "triage_category": report.triage_category,
                "created_at": report.created_at.isoformat(),
                "predictions": json.loads(report.predictions_json) if report.predictions_json else {},
                "patient_name": report.patient_name
            })
        
        return {"reports": reports_list}
    except Exception as e:
        logger.error(f"Failed to fetch reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/stats")
def get_reports_stats(session: Session = Depends(get_session)):
    """Calculate average health score and vitals from all reports."""
    logger.info("Calculating report statistics")
    try:
        reports = session.exec(select(PatientReport)).all()
        
        if not reports:
            return {
                "count": 0,
                "avg_health_score": 0,
                "latest_predictions": {},
                "avg_vitals": {}
            }
        
        # Calculate average health score
        total_health_score = sum(r.health_score for r in reports)
        avg_health_score = round(total_health_score / len(reports))
        
        # Get latest predictions
        latest_report = session.exec(
            select(PatientReport).order_by(PatientReport.created_at.desc())
        ).first()
        latest_predictions = json.loads(latest_report.predictions_json) if latest_report and latest_report.predictions_json else {}
        
        # Calculate average vitals
        vital_sums = {}
        vital_counts = {}
        
        for report in reports:
            if report.features_json:
                features = json.loads(report.features_json)
                for key, value in features.items():
                    if isinstance(value, (int, float)) and value is not None:
                        if key not in vital_sums:
                            vital_sums[key] = 0
                            vital_counts[key] = 0
                        vital_sums[key] += value
                        vital_counts[key] += 1
        
        avg_vitals = {}
        for key in vital_sums:
            if vital_counts[key] > 0:
                avg_vitals[key] = round(vital_sums[key] / vital_counts[key], 1)
        
        return {
            "count": len(reports),
            "avg_health_score": avg_health_score,
            "latest_predictions": latest_predictions,
            "avg_vitals": avg_vitals
        }
    except Exception as e:
        logger.error(f"Failed to calculate stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports/{report_id}")
def get_report(report_id: int, session: Session = Depends(get_session)):
    """Fetch a single report by ID."""
    logger.info(f"Fetching report {report_id}")
    try:
        report = session.get(PatientReport, report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {
            "id": report.id,
            "report_title": report.report_title or f"Report #{report.id}",
            "patient_name": report.patient_name,
            "health_score": report.health_score,
            "triage_category": report.triage_category,
            "predictions": json.loads(report.predictions_json) if report.predictions_json else {},
            "features": json.loads(report.features_json) if report.features_json else {},
            "warnings": json.loads(report.warnings_json) if report.warnings_json else [],
            "created_at": report.created_at.isoformat(),
            "blockchain_hash": report.blockchain_hash
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/reports/{report_id}")
def update_report(report_id: int, request: dict, session: Session = Depends(get_session)):
    """Update a report's title."""
    logger.info(f"Updating report {report_id}")
    try:
        report = session.get(PatientReport, report_id)
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Update report title
        if "report_title" in request:
            report.report_title = request["report_title"]
        
        session.add(report)
        session.commit()
        session.refresh(report)
        
        return {"success": True, "message": "Report updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

