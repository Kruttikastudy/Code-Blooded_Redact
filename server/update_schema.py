from sqlmodel import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)

def update_schema():
    print("Updating schema...")
    with engine.connect() as conn:
        conn.begin()
        try:
            # Add blockchain_block_index
            conn.execute(text("ALTER TABLE patientreport ADD COLUMN blockchain_block_index INTEGER;"))
            print("Added blockchain_block_index")
        except Exception as e:
            print(f"blockchain_block_index might already exist: {e}")

        try:
            # Add merkle_proof_json
            conn.execute(text("ALTER TABLE patientreport ADD COLUMN merkle_proof_json TEXT;"))
            print("Added merkle_proof_json")
        except Exception as e:
            print(f"merkle_proof_json might already exist: {e}")
            
        conn.commit()
    print("Schema update complete.")

if __name__ == "__main__":
    update_schema()
