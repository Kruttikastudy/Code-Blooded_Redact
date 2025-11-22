"""Database connection and session management for MediGuard.

Uses SQLModel (Pydantic + SQLAlchemy) to connect to Postgres via DATABASE_URL.
"""
import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

load_dotenv()

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL not found in environment variables. "
        "Please add it to server/.env (e.g., from Neon, Supabase, or Vercel Postgres)"
    )

# Create engine
engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    """Create all tables defined in models.py"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for FastAPI to get a database session."""
    with Session(engine) as session:
        yield session
