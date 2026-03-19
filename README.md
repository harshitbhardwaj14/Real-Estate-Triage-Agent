# Real Estate AI Triage Agent 🏡🤖

An intelligent, full-stack multi-agent AI system designed to automate the initial handling of real estate customer inquiries. Built with **CrewAI**, **FastAPI**, and **React**, this application classifies inquiry urgency, extracts key property details, and drafts professional responses in real-time. 

The system features secure user authentication and a role-based admin dashboard, with all data persistently stored in a **PostgreSQL (NeonDB)** database.

## ✨ Key Features

* 🤖 **Multi-Agent AI Pipeline:** Powered by CrewAI and Google Gemini 2.5 Flash. It uses a sequential three-agent team (Triage Specialist, Data Extraction Expert, and Client Relations Manager) to process natural language inquiries.
* 🔐 **Secure Authentication:** JWT-based user login and registration with raw `bcrypt` password hashing.
* 🗄️ **Persistent Storage:** All triage records and user credentials are saved securely to a PostgreSQL database using SQLAlchemy.
* 📊 **Admin Dashboard:** A dedicated, role-based view for administrators to monitor the top 15 most critical inquiries, automatically sorted by urgency (High > Medium > Low).
* 🌗 **Modern UI:** A responsive, chat-style React interface with seamless Dark/Light mode toggling and wrapped text formatting for full inquiry visibility.

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Native CSS
* **Backend:** FastAPI, Python, Uvicorn
* **AI Framework:** CrewAI, Langchain, Google Gemini API
* **Database:** PostgreSQL (NeonDB), SQLAlchemy, psycopg2-binary
* **Security:** python-jose (JWT), bcrypt

## 📐 Architecture & Workflow

1. **User Authentication:** Users log in or register via the React frontend. The FastAPI backend issues a JWT token.
2. **Inquiry Submission:** Authenticated users submit real estate inquiries (e.g., "The roof is leaking at REF-1234!") via the chat interface.
3. **CrewAI Processing:** * **Agent 1:** Classifies *Urgency* (High/Medium/Low) and *Intent* (Complaint, Viewing, Buying, etc.).
   * **Agent 2:** Extracts *Property IDs* (REF-XXXX) and *Appointment Dates*.
   * **Agent 3:** Drafts an empathetic, contextual response.
4. **Data Persistence:** The inquiry, structured AI analysis, and generated draft are saved to the NeonDB database.
5. **Admin Review:** Administrators can toggle to the Dashboard view to see all system-wide inquiries sorted by urgency, alongside the users' phone numbers.

## 📁 Repository Structure

```text
Real-Estate-Triage-Agent/
│
├── backend/                  # FastAPI Backend Services
│   ├── auth.py               # JWT authentication & bcrypt password verification
│   ├── crew_pipeline.py      # CrewAI pipeline execution logic
│   ├── database.py           # SQLAlchemy engine & NeonDB connection setup
│   ├── main.py               # FastAPI app, routing, and API endpoints
│   ├── models_db.py          # PostgreSQL DB Schemas (User, TriageRecord)
│   └── triage_service.py     # Wrapper service for the AI pipeline
│
├── frontend/                 # React (Vite) Frontend UI
│   ├── public/
│   ├── src/
│   │   ├── App.jsx           # Main application logic (Auth, Chat, Admin views)
│   │   ├── bgimage.jpg       # Theme background assets
│   │   ├── main.jsx          # React DOM entry point
│   │   └── styles.css        # Global styles and Dark/Light mode variables
│   ├── index.html
│   ├── package.json          # Node dependencies
│   └── vite.config.js
│
├── agents.py                 # CrewAI Agent definitions & personas
├── models.py                 # Pydantic models for enforcing structured AI output
├── tasks.py                  # CrewAI Task descriptions & prompt engineering
├── requirements.txt          # Python backend dependencies
└── .env                      # Environment variables (Git-ignored)
```

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+
* Node.js 18+
* A valid Google Gemini API Key
* A PostgreSQL Database URL (e.g., from NeonDB)

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add the following:

```env
GEMINI_API_KEY=your_actual_gemini_key_here
DATABASE_URL=postgresql://user:password@ep-your-db.region.aws.neon.tech/dbname?sslmode=require
SECRET_KEY=generate_a_random_secret_string_here
```

### 3. Start the Backend API
Open a terminal in the project root:

```powershell
# Install required Python packages
pip install -r requirements.txt

# Start the FastAPI server (Database tables will auto-generate on startup)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
*The backend API will run at `http://localhost:8000`*

### 4. Start the Frontend UI
Open a second terminal window and navigate to the frontend directory:

```powershell
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The React UI will be accessible at `http://localhost:5173`*

## 💡 Usage Notes

* **Creating an Admin Account:** To test the Admin Dashboard, register a new user from the login screen and include the word `"admin"` anywhere in the phone number field (e.g., `admin123`). The system will automatically flag this account with administrator privileges.
* **Testing Queries:** The UI includes built-in example queries ranging from standard viewing requests to high-urgency maintenance complaints to test the AI's classification accuracy.

---
**Author:** Harshit Bhardwaj
