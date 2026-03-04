from crewai import Crew, Process

from agents import RealEstateAgents
from tasks import RealEstateTasks


def run_triage(message: str) -> dict:
    agents = RealEstateAgents()
    tasks = RealEstateTasks()

    triage = agents.triage_agent()
    ner = agents.ner_specialist()
    writer = agents.support_writer()

    crew = Crew(
        agents=[triage, ner, writer],
        tasks=[
            tasks.classification_task(triage, message),
            tasks.extraction_task(ner),
            tasks.response_task(writer),
        ],
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff()

    if hasattr(result, "pydantic") and result.pydantic is not None:
        return result.pydantic.model_dump()

    if hasattr(result, "json_dict") and result.json_dict:
        return result.json_dict

    if hasattr(result, "raw"):
        raw = result.raw
        if isinstance(raw, dict):
            return raw

    raise ValueError("Triage pipeline did not return a structured JSON result.")
