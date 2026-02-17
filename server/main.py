from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ai_model import predictor
import uvicorn

app = FastAPI(title="Smart Healthcare AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-ai-based-healthcare.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomRequest(BaseModel):
    symptoms: str

@app.get("/")
def read_root():
    return {"status": "online", "message": "Healthcare AI API is running"}

@app.post("/predict")
def predict_condition(request: SymptomRequest):
    if not request.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms text is required")
    
    try:
        result = predictor.predict(request.symptoms)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting AI Server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
