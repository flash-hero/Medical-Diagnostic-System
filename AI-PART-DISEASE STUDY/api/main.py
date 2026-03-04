from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import disease
import uvicorn

# Initialize Main App
app = FastAPI(
    title="MedCare Modular API",
    description="Unified API for Disease Prediction (ML), Cancer Detection (DL), and Medical Chat (GenAI).",
    version="2.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Routers ---
# 1. Disease Prediction (Machine Learning)
app.include_router(disease.router, prefix="/disease", tags=["Disease Prediction"])

# 2. Cancer Detection (Deep Learning)
try:
    from routers import cancer
    app.include_router(cancer.router, prefix="/cancer", tags=["Cancer Detection (Deep Learning)"])
except ImportError as e:
    print(f"Cancer module dependencies not found: {e}. Cancer detection disabled.")

# 3. Medical Chatbot (GenAI)
try:
    from routers import chat
    app.include_router(chat.router, prefix="/chat", tags=["Medical Chatbot"])
except ImportError as e:
    print(f"Chat module dependencies not found: {e}. Chatbot disabled.")

@app.get("/")
def root():
    return {
        "message": "MedCare API is running.",
        "endpoints": {
            "disease": "/disease/predict",
            "cancer": "/cancer/scan",
            "chat": "/chat/message"
        }
    }

if __name__ == "__main__":
    print("Starting Modular API Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
