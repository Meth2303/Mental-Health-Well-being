# server/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import Optional

class RequestBody(BaseModel):
    input: str
    max_new_tokens: Optional[int] = 256
    temperature: Optional[float] = 0.8

app = FastAPI()

MODEL_ID = os.environ.get("MODEL_ID", "tanusrich/Mental_Health_Chatbot")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Starting server. Loading model {MODEL_ID} on {DEVICE}...")

# Load tokenizer and model once at startup
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(MODEL_ID)
model.to(DEVICE)
model.eval()

@app.post("/api/maya")
async def maya_reply(req: RequestBody):
    user_input = req.input
    if not user_input or not isinstance(user_input, str):
        raise HTTPException(status_code=400, detail="`input` string required")

    # Simple prompt framing - you can customise system messages here
    prompt = f"User: {user_input}\nMaya:"

    # Tokenize
    try:
        inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=req.max_new_tokens,
                temperature=req.temperature,
                top_p=0.9,
                do_sample=True,
                eos_token_id=tokenizer.eos_token_id,
                pad_token_id=tokenizer.eos_token_id,
            )
        generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Remove the prompt prefix if present
        if generated.startswith(prompt):
            generated = generated[len(prompt):].strip()
        # Some models include the full conversation; try to get the Maya part
        # Optionally trim at newline
        if "\n" in generated:
            # Keep everything until next 'User:' if present
            idx = generated.find("\nUser:")
            if idx != -1:
                generated = generated[:idx].strip()
        return {"reply": generated}
    except Exception as e:
        # Catch OOM or generation errors
        raise HTTPException(status_code=500, detail=f"Generation error: {e}")
