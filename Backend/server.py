# server.py (or app.py - whichever you're using)
import os
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from main import generate_asset_progression
from survey_landscape import generate_survey_landscape
from typing import Any, List, Dict
from pydantic import BaseModel
import requests
from google import genai

# Load your GEMINI_API_KEY from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI()

# CRITICAL: Add CORS middleware BEFORE mounting static files
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create assets directory if it doesn't exist
os.makedirs("assets", exist_ok=True)

# Mount the assets directory
app.mount("/assets", StaticFiles(directory="assets"), name="assets")


@app.get("/")
def root():
    return {"message": "ok"}


@app.get("/generate")
def generate(thing: str = Query(...)):
    """Generate progressive asset images (1-5 stages) for a single thing"""
    result = generate_asset_progression(thing)
    if result["error"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return {
        "thing": thing,
        "image_paths": result["image_paths"],
        "output_dir": result["output_dir"],
        "message": "Generation complete",
    }


@app.post("/generate-landscape")
def generate_landscape(survey_answers: List[Dict[str, Any]] = Body(...)):
    """
    Generate a composite landscape from survey answers.

    Expected format:
    [
        {"category": "dog", "score": 1},
        {"category": "sky", "score": 5},
        {"category": "tree", "score": 3}
    ]
    """
    # Validate input
    if not survey_answers:
        raise HTTPException(status_code=400, detail="Survey answers cannot be empty")

    for item in survey_answers:
        if "category" not in item or "score" not in item:
            raise HTTPException(
                status_code=400,
                detail="Each survey item must have 'category' and 'score'",
            )
        if not isinstance(item["score"], int) or not 1 <= item["score"] <= 5:
            raise HTTPException(
                status_code=400,
                detail=f"Score must be an integer between 1-5, got {item['score']}",
            )

    # Generate the landscape
    result = generate_survey_landscape(survey_answers)

    if result["error"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "survey_answers": survey_answers,
        "final_image_path": result["final_image_path"],
        "output_dir": result["output_dir"],
        "element_count": len(result["element_prompts"]),
        "message": "Landscape generation complete",
    }

class PunRequest(BaseModel):
    question: str
    theme: str

@app.post("/generate-pun")
def generate_pun(req: PunRequest):
    if not req.question or not req.theme:
        raise HTTPException(status_code=400, detail="Missing question or theme")
    try:
        prompt = f"""
        You are a creative assistant that generates short, clever puns for survey questions.
        Rules:
        - Rewrite the question as a light, playful pun inspired by the theme
        - Preserve the original meaning
        - Output only one sentence
        - Survey-appropriate tone
        - Avoid sarcasm or negativity

        Survey Question: "{req.question}"
        Theme: "{req.theme}"

        Generate a pun-based survey question (1 sentence).
        """
        response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
        )

        pun_text = response.text
        return {"pun": pun_text}

    except Exception as e:
        print("Gemini API error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate pun")

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
