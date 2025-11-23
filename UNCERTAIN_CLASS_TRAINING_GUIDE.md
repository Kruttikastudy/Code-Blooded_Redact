# Guide: Adding "Uncertain" Class to CatBoost Model

## Overview
This guide explains how to retrain the CatBoost model with an "Uncertain" class to recognize anomalous data patterns.

## Step 1: Prepare Training Data

You need to add synthetic "Uncertain" samples to your training dataset. These should represent:
- Highly uniform values
- All identical values  
- Outlier combinations
- Sparse feature sets

### Code to Add to `REDACT2.ipynb`

```python
# After loading your original data
import numpy as np
import pandas as pd

# Generate synthetic uncertain/anomalous samples
def generate_uncertain_samples(n_samples=500):
    uncertain_data = []
    
    # Type 1: All identical values (50%)
    for i in range(n_samples // 2):
        value = np.random.choice([50, 55, 60, 100, 150])
        row = [value] * 24  # All features same value
        uncertain_data.append(row)
    
    # Type 2: Highly uniform with low variance (30%)
    for i in range(int(n_samples * 0.3)):
        base = np.random.uniform(50, 200)
        row = base + np.random.normal(0, base * 0.02, 24)  # 2% variance
        uncertain_data.append(row.tolist())
    
    # Type 3: Sparse data (many zeros/nulls) (20%)
    for i in range(int(n_samples * 0.2)):
        row = np.random.uniform(50, 200, 24)
        # Randomly zero out 70% of features
        mask = np.random.choice([0, 1], size=24, p=[0.7, 0.3])
        row = row * mask
        uncertain_data.append(row.tolist())
    
    return np.array(uncertain_data)

# Generate uncertain samples
uncertain_X = generate_uncertain_samples(500)
uncertain_y = np.full(500, 5)  # Label 5 for "Uncertain"

# Combine with your existing data
X_combined = np.vstack([X, uncertain_X])
y_combined = np.concatenate([y, uncertain_y])

# Shuffle
shuffle_idx = np.random.permutation(len(X_combined))
X_combined = X_combined[shuffle_idx]
y_combined = y_combined[shuffle_idx]
```

## Step 2: Update Label Mapping

```python
# Update your LABEL_MAP
LABEL_MAP = {
    0: 'Anemia',
    1: 'Diabetes', 
    2: 'Healthy',
    3: 'Thalasse',
    4: 'Thromboc',
    5: 'Uncertain'  # NEW
}
```

## Step 3: Retrain the Model

```python
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_combined, y_combined, test_size=0.2, random_state=42, stratify=y_combined
)

# Class weights (give Uncertain class higher weight)
class_weights = {
    0: 1.0, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0,
    5: 1.5  # Higher weight for uncertain to make model more sensitive
}

# Train CatBoost
model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.1,
    depth=6,
    class_weights=class_weights,
    random_state=42,
    verbose=100
)

model.fit(X_train, y_train, eval_set=(X_test, y_test))

# Save the new model
import joblib
joblib.dump(model, 'mediguard_catboost_with_uncertain.pkl')
```

## Step 4: Update Backend

### Update `server/main.py`

```python
# Update LABEL_MAP
LABEL_MAP = {
    0: 'Anemia',
    1: 'Diabetes',
    2: 'Healthy',
    3: 'Thalasse',
    4: 'Thromboc',
    5: 'Uncertain'
}

# Update health score calculation
if predicted_class == 'Uncertain':
    health_score = 0
    triage_category = "Uncertain"
else:
    health_score = round(predictions.get('Healthy', 0) * 100)
    triage_category = "Green"
    if health_score < 60: triage_category = "Red"
    elif health_score < 80: triage_category = "Yellow"
```

### Replace Model File

```bash
# In server directory
cp ../mediguard_catboost_with_uncertain.pkl mediguard_catboost.pkl
```

## Step 5: Verify

Test with anomalous inputs:
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=All vitals are 55&mode=text"
```

Expected output:
```json
{
  "analysis": {
    "predicted_class": "Uncertain",
    "predictions": {
      "Uncertain": 0.85,
      "Healthy": 0.10,
      ...
    }
  }
}
```

## Benefits of Both Approaches

**Option 1 (Current - Input Validation):**
- ✅ Immediate deployment
- ✅ Catches obvious anomalies before prediction
- ✅ Clear error messages
- ❌ Rule-based (might miss edge cases)

**Option 2 (Model-based - Uncertain Class):**
- ✅ Learns patterns from data
- ✅ Can detect subtle anomalies
- ✅ More robust to variations
- ❌ Requires retraining
- ❌ Needs quality uncertain samples

## Recommended Strategy

**Use both together:**
1. **Option 1 (Input Validation)** catches extreme cases early (all same values)
2. **Option 2 (Uncertain Class)** catches subtle anomalies the model learned

This provides defense in depth!
