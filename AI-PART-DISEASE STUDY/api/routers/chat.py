from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

# Configure Gemini API with environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables")

# Input Schema
class ChatRequest(BaseModel):
    message: str
    context: str = "" # e.g. "Patient Diagnosis: Influenza"
    history: list = [] 

@router.post("/message")
async def chat_message(request: ChatRequest):
    """
    Medical Chatbot using Google Gemini.
    Uses API key from environment variables.
    Optional: 'context' field for diagnosis info.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    try:
        # 1. Gemini is already configured at startup
        
        # 2. Set up the Model (using latest Gemini 2.5 Flash - fastest model as of 2026)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # 3. Construct Prompt with Context
        system_context = (
            "You are MedCare AI, a helpful medical assistant. "
            "Analyze the user's symptoms or questions and provide general medical advice. "
            "IMPORTANT: Always advise the user to consult a real doctor for serious issues. "
            f"Context Info: {request.context}\n"
            "Do not make definitive diagnoses. If context is provided, assume it is a potential condition to discuss.\n\n"
        )
        
        full_prompt = system_context + f"User: {request.message}\nMedCare AI:"
        
        # 4. Generate Response
        response = model.generate_content(full_prompt)
        
        return {
            "reply": response.text,
            "status": "success",
            "provider": "Google Gemini"
        }

    except Exception as e:
        # Handle invalid keys or API errors
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")
