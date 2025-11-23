import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def run_demo():
    print_section("MediGuard Blockchain Pipeline Demo")
    
    # 1. Analyze Patient Data
    print("\n[1] Sending Analysis Request...")
    payload = {
        "text": "Patient presents with elevated glucose (140 mg/dL) and BMI of 30. Blood pressure is 130/85.",
        "mode": "text"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
        response.raise_for_status()
        data = response.json()
        
        report_id = data.get("report_id")
        blockchain_log = data.get("blockchain_log")
        
        print(f"Analysis Complete! Report ID: {report_id}")
        print("\nBlockchain Block Created:")
        print(json.dumps(blockchain_log, indent=2))
        
        if not report_id:
            print("Error: No report ID returned.")
            return

    except Exception as e:
        print(f"Analysis failed: {e}")
        return

    # 2. Issue Digital Passport
    print_section("[2] Issuing Digital Passport...")
    try:
        response = requests.post(f"{BASE_URL}/api/passport/issue?report_id={report_id}")
        response.raise_for_status()
        passport_data = response.json().get("passport", {})
        
        passport_id = passport_data.get("passport_id")
        token = passport_data.get("hmac_token")
        
        print(f"Passport Issued! ID: {passport_id}")
        print(f"HMAC Token: {token}")
        print(f"RSA Signature: {passport_data.get('rsa_signature')[:50]}...")
        print(f"Merkle Proof: {passport_data.get('merkle_proof_json')}")
        
    except Exception as e:
        print(f"Passport issuance failed: {e}")
        return

    # 3. Verify Passport
    print_section("[3] Verifying Passport...")
    try:
        verify_url = f"{BASE_URL}/api/passport/verify/{passport_id}?token={token}"
        response = requests.get(verify_url)
        result = response.json()
        
        print(f"Verification Result: {result.get('status')}")
        print(f"Details: {result.get('details')}")
        
    except Exception as e:
        print(f"Verification failed: {e}")

    # 4. Verify Blockchain Integrity
    print_section("[4] Verifying Full Blockchain Integrity...")
    try:
        response = requests.get(f"{BASE_URL}/api/blockchain/verify")
        chain_report = response.json()
        
        print(f"Chain Valid: {chain_report.get('is_valid')}")
        print(f"Chain Length: {chain_report.get('length')}")
        if chain_report.get('errors'):
            print("Errors found:")
            print(json.dumps(chain_report['errors'], indent=2))
        else:
            print("No errors found. Blockchain is immutable and secure.")
            
    except Exception as e:
        print(f"Blockchain verification failed: {e}")

if __name__ == "__main__":
    run_demo()
