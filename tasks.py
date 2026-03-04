from crewai import Task
from models import TriageResult

class RealEstateTasks:
    def classification_task(self, agent, text):
        return Task(
            description=f"Analyze this inquiry: '{text}'. Determine if it is high urgency and what the user wants.",
            expected_output="A summary of urgency and intent.",
            agent=agent
        )

    def extraction_task(self, agent):
        return Task(
            description="Extract the Property ID (e.g., REF-XXXX) and any specific dates mentioned for viewings.",
            expected_output="Property ID and specific date if available.",
            agent=agent
        )

    def response_task(self, agent):
        return Task(
            description="Create a professional draft reply. Use the Property ID and date to personalize it.",
            expected_output="A complete JSON-formatted TriageResult.",
            output_json=TriageResult,
            agent=agent
        )