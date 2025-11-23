import sys
import os
import json
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Add server directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../server"))

from main import app, get_session
from models import PatientReport, DigitalPassport
from blockchain_manager import BlockchainManager
from merkle_tree import MerkleTree

# Setup in-memory DB for testing
engine = create_engine(
    "sqlite://", 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)

def create_test_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_test_session():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = get_test_session

client = TestClient(app)

@pytest.fixture(name="session")
def session_fixture():
    create_test_db_and_tables()
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

def test_blockchain_manager_rsa():
    bm = BlockchainManager("test_chain.json")
    data = b"test data"
    signature = bm.sign_data(data)
    assert bm.verify_signature(data, signature)
    assert not bm.verify_signature(b"tampered", signature)
    
    # Cleanup
    if os.path.exists("test_chain.json"):
        os.remove("test_chain.json")

def test_merkle_tree():
    leaves = ["a", "b", "c", "d"]
    # Hash leaves first as our implementation expects strings but usually we hash content first
    # Our implementation in main.py hashes content before creating tree? 
    # No, main.py passes json string. MerkleTree hashes them.
    
    mt = MerkleTree(leaves)
    root = mt.get_root()
    assert root is not None
    assert len(root) == 64 # SHA256 hex digest length
    
    proof = mt.get_proof(0)
    assert len(proof) == 2 # Log2(4) = 2 levels

def test_full_pipeline(session):
    # 1. Analyze (Create Report & Block)
    # We need to mock the intake/predictive agents or just call the endpoint if they are mocked enough
    # main.py uses real agents. We might need to mock them if they require external APIs.
    # For this test, we'll assume they work or fail gracefully.
    # Actually, predictive agent requires Gemini API key. If not present, it mocks.
    
    payload = {
        "text": "Patient has high glucose 140 and bmi 30.",
        "mode": "text"
    }
    
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert "blockchain_log" in data
    assert "report_id" in data
    report_id = data["report_id"]
    
    # Verify Block
    block = data["blockchain_log"]
    assert block["rsa_signature"] is not None
    assert block["is_valid"] is True
    
    # 2. Issue Passport
    response = client.post(f"/api/passport/issue?report_id={report_id}")
    assert response.status_code == 200
    passport_data = response.json()["passport"]
    
    passport_id = passport_data["passport_id"]
    token = passport_data["hmac_token"]
    
    assert passport_data["qr_code_png_base64"] is not None
    
    # 3. Verify Passport
    response = client.get(f"/api/passport/verify/{passport_id}?token={token}")
    assert response.status_code == 200
    verify_data = response.json()
    
    assert verify_data["status"] == "Valid"
    
    # 4. Verify Blockchain Integrity
    response = client.get("/api/blockchain/verify")
    assert response.status_code == 200
    chain_report = response.json()
    assert chain_report["is_valid"] is True

if __name__ == "__main__":
    # Manually run tests if pytest not installed or for quick check
    try:
        test_blockchain_manager_rsa()
        print("RSA Test Passed")
        test_merkle_tree()
        print("Merkle Tree Test Passed")
        # Full pipeline requires DB setup which is complex in main block
        print("Run with pytest for full pipeline test")
    except Exception as e:
        print(f"Tests failed: {e}")
