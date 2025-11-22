"""Database models for MediGuard using SQLModel."""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    """Stores user account information."""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)  # Unique email for login
    hashed_password: str  # Never store plain passwords!
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True

class PatientReport(SQLModel, table=True):
    """Stores analysis results from the AI agents."""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Patient Info
    patient_name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    
    # Analysis Results
    health_score: int
    triage_category: str  # "Green", "Yellow", "Red"
    
    # Raw Data (JSON stored as text)
    raw_text: Optional[str] = None  # Original input text
    features_json: Optional[str] = None  # JSON dump of clean_features
    warnings_json: Optional[str] = None  # JSON dump of warnings
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    blockchain_hash: Optional[str] = None  # Hash from blockchain log
    
    class Config:
        arbitrary_types_allowed = True
