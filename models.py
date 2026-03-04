from pydantic import BaseModel, Field
from typing import Optional

class TriageResult(BaseModel):
    urgency: str = Field(description="Priority level: High, Medium, or Low")
    intent: str = Field(description="Primary intent: Buying, Selling, Renting, or Viewing")
    property_id: Optional[str] = Field(description="The unique Property ID mentioned (e.g., REF-123)")
    appointment_date: Optional[str] = Field(description="Specific date requested for a meeting or viewing")
    draft_response: str = Field(description="A professional and empathetic response draft")