import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_shap_explanation():
    print("\n--- Testing SHAP Explanation ---")
    
    # Wait for server to start
    time.sleep(5)
    
    # Sample text
    text = "Patient has high glucose 140 and BMI 30."
    
    payload = {
        "text": text,
        "mode": "text"
    }
    
    try:
        # Use data=payload for Form data
        response = requests.post(f"{BASE_URL}/api/analyze", data=payload)
        
        if response.status_code == 200:
            data = response.json()
            analysis = data.get("analysis", {})
            explanation = analysis.get("explanation")
            
            print("Status: Success")
            print(f"Predicted Class: {analysis.get('predicted_class')}")
            
            if explanation:
                print("\nSHAP Explanation:")
                if "error" in explanation:
                    print(f"Error in SHAP: {explanation['error']}")
                else:
                    print(f"Base Value: {explanation.get('base_value')}")
                    print("Top Contributing Features:")
                    for feature in explanation.get("top_features", []):
                        print(f"  - {feature['feature']}: Impact {feature['impact']:.4f} (Value: {feature['value']})")
            else:
                print("FAILURE: No explanation found in response.")
        else:
            print(f"FAILURE: API returned {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_shap_explanation()
