from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import case

from backend.triage_service import execute_triage
from backend.database import engine, Base, get_db
from backend.models_db import User, TriageRecord
from backend.auth import (
    get_password_hash, verify_password, create_access_token, 
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Real Estate AI Triage API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class UserCreate(BaseModel):
    phone_number: str
    password: str
    is_admin: bool = False

class TriageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Customer inquiry text")

# --- Endpoints ---

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone_number == user.phone_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = User(phone_number=user.phone_number, hashed_password=hashed_pwd, is_admin=user.is_admin)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect phone number or password")
    
    access_token = create_access_token(
        data={"sub": user.phone_number, "is_admin": user.is_admin},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user.is_admin}


@app.post("/triage")
def triage(payload: TriageRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    try:
        # Run CrewAI Pipeline
        result = execute_triage(payload.message)
        
        # Save to Database
        new_record = TriageRecord(
            user_id=current_user.id,
            inquiry=payload.message,
            urgency=result.get("urgency", "Low"),
            intent=result.get("intent", "General Inquiry"),
            property_id=result.get("property_id"),
            appointment_date=result.get("appointment_date"),
            draft_response=result.get("draft_response", "")
        )
        db.add(new_record)
        db.commit()

        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.get("/admin/records")
def get_admin_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Custom sort: High=1, Medium=2, Low=3
    urgency_order = case(
        (TriageRecord.urgency == 'High', 1),
        (TriageRecord.urgency == 'Medium', 2),
        (TriageRecord.urgency == 'Low', 3),
        else_=4
    )
    
    # Join TriageRecord and User to get the phone number
    results = db.query(TriageRecord, User.phone_number)\
        .join(User, TriageRecord.user_id == User.id)\
        .order_by(urgency_order, TriageRecord.created_at.desc())\
        .limit(15).all()
        
    # Format the combined data into a flat dictionary
    formatted_records = []
    for record, phone in results:
        formatted_records.append({
            "id": record.id,
            "phone_number": phone,
            "urgency": record.urgency,
            "intent": record.intent,
            "inquiry": record.inquiry,
            "property_id": record.property_id
        })
        
    return formatted_records