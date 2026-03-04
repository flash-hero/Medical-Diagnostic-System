from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

router = APIRouter()

# --- Assets Loading ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: routers/ folder is one level deeper, so we go up two levels to find MACHINE LEARNING
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "MACHINE LEARNING", "Model"))

model = None
encoder_sex = None
encoder_blood = None

try:
    print(f"[Loading Disease Assets] from: {MODEL_DIR}")
    model = joblib.load(os.path.join(MODEL_DIR, "disease_prediction_model.pkl"))
    encoder_sex = joblib.load(os.path.join(MODEL_DIR, "encoder_sex.pkl"))
    encoder_blood = joblib.load(os.path.join(MODEL_DIR, "encoder_blood.pkl"))
    print("SUCCESS: Disease Model Loaded.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load Disease Model. {e}")

# --- Input Schema ---
class PatientData(BaseModel):
    Age: int
    Sex: str
    Blood_Type: str
    Body_Temperature: float
    Heart_Rate: int
    Systolic_BP: int
    Diastolic_BP: int
    BMI: float
    Symptom_Cough: int
    Symptom_Fatigue: int
    Symptom_Sore_Throat: int
    Symptom_Shortness_of_Breath: int
    Symptom_Headache: int

# --- Routes ---

@router.post("/predict")
def predict_disease(data: PatientData):
    """
    Predicts disease based on patient data.
    Endpoint: /disease/predict
    """
    if not model:
        raise HTTPException(status_code=500, detail="Disease Model not initialized")

    try:
        # 1. Encode Attributes
        try:
            sex_encoded = encoder_sex.transform([data.Sex])[0]
        except ValueError:
            valid_sex = list(encoder_sex.classes_)
            raise HTTPException(status_code=400, detail=f"Invalid Sex '{data.Sex}'. Valid options: {valid_sex}")

        try:
            blood_encoded = encoder_blood.transform([data.Blood_Type])[0]
        except ValueError:
            valid_blood = list(encoder_blood.classes_)
            raise HTTPException(status_code=400, detail=f"Invalid Blood Type '{data.Blood_Type}'. Valid options: {valid_blood}")
        
        # 2. DataFrame Construction
        input_data = {
            'Age': data.Age,
            'Sex': sex_encoded,
            'Blood_Type': blood_encoded,
            'Body_Temperature': data.Body_Temperature,
            'Heart_Rate': data.Heart_Rate,
            'Systolic_BP': data.Systolic_BP,
            'Diastolic_BP': data.Diastolic_BP,
            'BMI': data.BMI,
            'Symptom_Cough': data.Symptom_Cough,
            'Symptom_Fatigue': data.Symptom_Fatigue,
            'Symptom_Sore_Throat': data.Symptom_Sore_Throat,
            'Symptom_Shortness_of_Breath': data.Symptom_Shortness_of_Breath,
            'Symptom_Headache': data.Symptom_Headache
        }
        
        df = pd.DataFrame([input_data])
        
        # 3. Predict
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        class_index = list(model.classes_).index(prediction)
        confidence = probabilities[class_index]
        
        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "module": "Machine Learning (Random Forest)"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
