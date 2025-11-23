"""Database models for MediGuard."""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class User(SQLModel, table=True):
    """Stores user account information."""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True)  # Unique patient ID
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True

class PatientReport(SQLModel, table=True):
    """Stores analysis results from the AI agents."""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # User Association
    patient_id: Optional[str] = None  # Link to User.patient_id
    
    # Report Metadata
    report_title: Optional[str] = None  # User-friendly report name
    
    # Patient Info
    patient_name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    
    # Analysis Results
    health_score: int
    triage_category: str  # "Green", "Yellow", "Red"
    
    # Predictions (Disease Risks)
    predictions_json: Optional[str] = None  # JSON dump of disease predictions
    
    # Raw Data (JSON stored as text)
    raw_text: Optional[str] = None  # Original input text
    features_json: Optional[str] = None  # JSON dump of clean_features
    warnings_json: Optional[str] = None  # JSON dump of warnings
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    blockchain_hash: Optional[str] = None  # Hash from blockchain log
    blockchain_block_index: Optional[int] = None
    merkle_proof_json: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True

class DigitalPassport(SQLModel, table=True):
    """Digital Passport for verifiable health credentials."""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    passport_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True)
    patient_report_id: int = Field(foreign_key="patientreport.id")
    
    # Snapshot of key data
    health_score: int
    triage_category: str
    predicted_class: str
    
    # Metadata
    issued_timestamp: str
    expiry_timestamp: Optional[str] = None
    
    # Blockchain Proofs
    blockchain_block_index: int
    merkle_proof_json: str  # JSON array
    passport_hash: str
    
    # Security
    hmac_token: str
    rsa_signature: str
    
    # QR Codes
    qr_code_png_base64: str
    qr_code_svg: str
    verification_url: str
    
    is_valid: bool = True
    audit_trail_json: str  # JSON array of audit events
    
    class Config:
        arbitrary_types_allowed = True
