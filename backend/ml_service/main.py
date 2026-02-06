from fastapi import FastAPI
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()


@app.post("/predict")
async def predict_time(grade: int, subject: str, last_score: float):
    # Placeholder for your Adaptive Logic
    # Example: Base time 30m, adjusted by grade and performance
    base_time = 30 + (grade * 2)
    prediction = base_time * (1.5 if last_score < 50 else 0.9)
    return {"suggested_duration": prediction, "unit": "minutes"}
