from backend.crew_pipeline import run_triage
import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def is_real_estate_query(message: str) -> bool:
    """
    Acts as a fast gatekeeper to filter out spam or irrelevant queries
    before they hit the database or the heavy CrewAI pipeline.
    """
    # We use Flash because it is incredibly fast and cheap for simple binary classification
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are a strict spam filter for a real estate agency.
    Determine if the following customer message is related to real estate, property management, leasing, buying, selling, or household maintenance.
    
    Message: "{message}"
    
    Reply ONLY with the exact word "YES" if it is relevant, or "NO" if it is not. Do not include any other text.
    """
    
    try:
        response = model.generate_content(prompt)
        # Check if the AI replied with YES
        return "YES" in response.text.strip().upper()
    except Exception as e:
        print(f"Gatekeeper error: {e}")
        # If the API fails for some reason, default to True so we don't accidentally block valid user requests
        return True 

def execute_triage(message: str) -> dict:
    return run_triage(message)
