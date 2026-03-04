from crewai import Crew, Process
from agents import RealEstateAgents
from tasks import RealEstateTasks

def run_triage_system(inquiry_text):
    # Initialize agents and tasks
    agents = RealEstateAgents()
    tasks = RealEstateTasks()

    triage = agents.triage_agent()
    ner = agents.ner_specialist()
    writer = agents.support_writer()

    # Form the Crew
    real_estate_crew = Crew(
        agents=[triage, ner, writer],
        tasks=[
            tasks.classification_task(triage, inquiry_text),
            tasks.extraction_task(ner, inquiry_text),
            tasks.response_task(writer, inquiry_text)
        ],
        process=Process.sequential,
        verbose=True
    )

    return real_estate_crew.kickoff()

if __name__ == "__main__":
    user_input = "Hey! I saw the house with ID REF-8821. I need to see it this Friday morning, I'm only in town for a day!"
    
    result = run_triage_system(user_input)
    print("\n\n" + "="*30)
    print("FINAL TRIAGE REPORT")
    print("="*30)
    print(result.raw)
