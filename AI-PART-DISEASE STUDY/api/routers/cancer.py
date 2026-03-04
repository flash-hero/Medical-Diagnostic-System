from fastapi import APIRouter, File, UploadFile, HTTPException
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import os
import joblib

router = APIRouter()

# --- Assets Loading ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Deep Learning folder is ../../DEEP LEARNING/Model
DL_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "DEEP LEARNING", "Model"))

model = None
class_indices = None

def load_cancer_model():
    """
    Lazy loading: We define this as a function so we can try to load it on startup,
    but if the file doesn't exist yet (because user is training on Colab), app won't crash.
    """
    global model, class_indices
    model_path = os.path.join(DL_DIR, "lung_cancer_model.h5")
    indices_path = os.path.join(DL_DIR, "class_indices.pkl")
    
    if os.path.exists(model_path) and os.path.exists(indices_path):
        try:
            print(f"[Loading Cancer Model] from: {model_path}")
            model = load_model(model_path)
            # Load indices (e.g., {'Benign': 0, 'Malignant': 1, ...})
            # We need to flip it to {0: 'Benign', 1: 'Malignant'}
            indices = joblib.load(indices_path)
            class_indices = {v: k for k, v in indices.items()}
            print("SUCCESS: Cancer Model Loaded.")
            return True
        except Exception as e:
            print(f"ERROR: Found model files but failed to load. {e}")
            return False
    else:
        print("[Cancer Model] status: Not found (waiting for user to add .h5 file)")
        return False

# Try to load immediately
load_cancer_model()

@router.post("/scan")
async def scan_cancer(file: UploadFile = File(...)):
    """
    Upload an X-Ray/CT-Scan image to detect Lung Cancer.
    """
    # If model isn't loaded, try to load it again (maybe user just added the file)
    if not model:
        if not load_cancer_model():
            raise HTTPException(status_code=503, detail="Cancer Model not yet installed. Please complete the Colab training step.")

    try:
        # 1. Read Image
        contents = await file.read()
        pil_image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # 2. Preprocess (same as training: 224x224, scale 1/255)
        pil_image = pil_image.resize((224, 224))
        img_array = image.img_to_array(pil_image)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # Normalize
        
        # 3. Predict
        predictions = model.predict(img_array)
        score = predictions[0]
        
        # Find highest probability class
        predicted_class_index = np.argmax(score)
        predicted_label = class_indices[predicted_class_index]
        confidence = float(score[predicted_class_index])
        
        return {
            "prediction": predicted_label,
            "confidence": f"{confidence:.2%}",
            "raw_scores": {label: float(score[i]) for i, label in class_indices.items()}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {str(e)}")
