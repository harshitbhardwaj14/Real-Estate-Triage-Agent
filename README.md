# Real Estate AI Triage Agent

## Quick Start (New and Returning Developers)

### 1. Prerequisites
- Python 3.10+ (recommended: 3.11+)
- Node.js 18+ (you are currently fine with Node 20)
- A valid Gemini API key

### 2. Configure Environment
Create/update `.env` in the project root:

```env
GEMINI_API_KEY=your_actual_key_here
```

### 3. Start Backend API
From project root:

```powershell
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: `http://localhost:8000`

### 4. Start Frontend UI
In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173` (default Vite port).

### 5. Use the App
- Open the frontend URL.
- Paste an inquiry (or click example buttons).
- Click `Analyze Inquiry`.
- The UI calls backend `POST /triage` and displays:
  - Urgency
  - Intent
  - Property ID
  - Appointment Date
  - Draft Response

## Project Summary
This project is an AI-powered real estate triage assistant. It receives a customer inquiry and runs a multi-agent CrewAI pipeline to:

1. Classify urgency and intent
2. Extract structured entities (property reference and dates)
3. Generate a professional response draft

The result is returned as structured JSON and shown in a web UI.

## Current Architecture
`React (Vite) UI` -> `FastAPI backend` -> `CrewAI pipeline` -> `Structured JSON` -> `UI result display`

## Repository Structure
```text
Real-Estate-Triage-Agent/
├─ agents.py                  # CrewAI agent definitions
├─ tasks.py                   # CrewAI task definitions/prompts
├─ models.py                  # Pydantic schema for triage output
├─ main.py                    # Legacy CLI runner (manual/local testing)
├─ backend/
│  ├─ main.py                 # FastAPI app (/health, /triage)
│  ├─ triage_service.py       # Service wrapper for triage execution
│  └─ crew_pipeline.py        # Reusable run_triage(message) pipeline
├─ frontend/
│  ├─ package.json
│  ├─ index.html
│  ├─ vite.config.js
│  └─ src/
│     ├─ App.jsx              # UI + API integration
│     ├─ main.jsx
│     └─ styles.css
├─ requirements.txt
└─ .env
```

## Backend API

### Health Check
- `GET /health`
- Response:
```json
{ "status": "ok" }
```

### Triage Endpoint
- `POST /triage`
- Request body:
```json
{
  "message": "I submitted a maintenance complaint for REF-1209 last week and haven't heard back."
}
```

- Response body (example):
```json
{
  "urgency": "High",
  "intent": "Complaint",
  "property_id": "REF-1209",
  "appointment_date": null,
  "draft_response": "Dear Client, ... "
}
```

## Triage Output Contract
The final model currently supports:
- `urgency`: `High | Medium | Low`
- `intent`: `Buying | Selling | Renting | Viewing | Complaint | General Inquiry`
- `property_id`: string or null
- `appointment_date`: string or null
- `draft_response`: string

## Notes for Developers
- `backend/crew_pipeline.py` is the reusable integration point for any future channels (webhook, WhatsApp, CRM, etc.).
- `main.py` (root) still exists as a CLI prototype runner; API production path uses `backend/main.py`.
- Frontend API URL is currently hardcoded in `frontend/src/App.jsx` as:
  - `http://localhost:8000/triage`

## Common Issues and Fixes

1. `GEMINI_API_KEY` missing
- Symptom: triage calls fail with LLM/auth errors.
- Fix: verify `.env` exists at project root and contains valid `GEMINI_API_KEY`.

2. Frontend fails with JSON parse/postcss config style error
- Cause seen earlier: BOM in `frontend/package.json`.
- Fix: ensure JSON files are UTF-8 **without BOM**.

3. CORS errors in browser
- Backend already enables permissive CORS in `backend/main.py`.
- Confirm backend is running on port `8000`.

## Development Workflow
1. Update prompts/tasks in `tasks.py`.
2. Update schema constraints in `models.py` when changing output contract.
3. Validate locally from UI and API:
   - `POST /triage`
   - frontend analyze flow
4. Keep response keys stable to avoid UI regressions.

## Minimal Manual API Test (Optional)
```powershell
curl -X POST "http://localhost:8000/triage" `
  -H "Content-Type: application/json" `
  -d "{\"message\":\"I want to view REF-8821 this Friday morning\"}"
```
