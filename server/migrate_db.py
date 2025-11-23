"""
Quick database migration to add explanation_json column.
Run this once to update the database schema.
"""
from sqlmodel import create_engine, Session, text
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mediguard.db")

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Add the new column
with Session(engine) as session:
    try:
        # Add explanation_json column to patientreport table
        session.exec(text("ALTER TABLE patientreport ADD COLUMN explanation_json TEXT;"))
        session.commit()
        print("✅ Successfully added explanation_json column to patientreport table")
    except Exception as e:
        if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
            print("⚠️  Column explanation_json already exists, skipping migration")
        else:
            print(f"❌ Migration failed: {e}")
            raise
