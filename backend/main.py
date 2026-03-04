from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.triage_service import execute_triage


class TriageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Customer inquiry text")


app = FastAPI(title="Real Estate AI Triage API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/triage")
def triage(payload: TriageRequest) -> dict:
    try:
        return execute_triage(payload.message)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
