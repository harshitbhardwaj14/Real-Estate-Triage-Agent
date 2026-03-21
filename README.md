
<div align="center">

  <h1>🏡 Real Estate AI Triage Agent</h1>
  
  <p>
    <strong>Intelligent, Multi-Agent Automation for Real Estate Customer Support</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/AI-CrewAI-FF453A?style=for-the-badge" alt="CrewAI" />
  </p>
</div>

---

## 📖 Overview

The **Real Estate AI Triage Agent** is a full-stack application that uses artificial intelligence to automatically handle customer inquiries for real estate businesses. When a customer sends a message—whether it's an urgent maintenance request or a simple question about a property—the AI system instantly analyzes it, determines how important it is, extracts key information (like property IDs), and crafts a thoughtful, personalized response.

This ensures that every customer feels heard and no request gets overlooked, while saving valuable time for human staff who can focus on more complex tasks.

---

## 📂 Project Structure

The application is organized into two main parts: a Python backend that handles the AI and database logic, and a React frontend that provides the user interface.

```text
real-estate-ai-triage/
│
├── backend/                       # 🐍 FastAPI Backend & AI Logic
│   ├── alembic/                   # Database migration tracking folder
│   ├── agents.py                  # CrewAI persona definitions (Triage, Data, CRM)
│   ├── auth.py                    # JWT token generation & password encryption
│   ├── crew_pipeline.py           # Core logic linking agents and tasks together
│   ├── database.py                # SQLAlchemy engine & NeonDB connection setup
│   ├── main.py                    # FastAPI server, API routing, and endpoints
│   ├── models.py                  # Pydantic schemas enforcing AI JSON output
│   ├── models_db.py               # PostgreSQL DB tables (User, TriageRecord)
│   ├── tasks.py                   # CrewAI prompt engineering and assignments
│   └── triage_service.py          # Wrapper service executing the CrewAI pipeline
│
├── frontend/                      # ⚛️ React (Vite) Frontend UI
│   ├── public/
│   ├── src/
│   │   ├── components/            # Modular UI Components
│   │   │   ├── Admin.jsx          # Admin dashboard for managing global inquiries
│   │   │   ├── Chat.jsx           # User chat interface and personal request history
│   │   │   ├── Header.jsx         # Dynamic top navigation bar
│   │   │   └── Login.jsx          # Auth screen with split-pane welcome card
│   │   │
│   │   ├── App.jsx                # Global state manager (Theme, Auth) and view router
│   │   ├── main.jsx               # React DOM entry point
│   │   ├── styles.css             # Global styling and Dark/Light theme variables
│   │   └── bgimage.jpg            # Application background asset
│   │
│   ├── package.json               # Node dependencies and scripts
│   └── vite.config.js             # Vite build configuration
│
├── alembic.ini                    # Alembic migration settings
├── requirements.txt               # Python backend dependencies
├── test_ai.py                     # Command-line tester for rapid AI prompt testing
├── .env                           # Environment variables (Git-ignored API keys)
└── README.md                      # Project documentation
```

---

## ✨ Key Features

- **Multi-Agent AI System:** Three specialized AI agents work together as a team—one to understand the inquiry, one to extract important details, and one to craft the perfect response.
- **Two User Experiences:**
  - **Regular Users:** Submit inquiries, get instant AI responses, and view their personal request history
  - **Admins:** See all incoming inquiries sorted by urgency and update ticket statuses
- **Secure Login:** Complete registration and login with phone number verification, encrypted passwords, and secure session tokens
- **Persistent Data Storage:** All information is safely stored in a PostgreSQL database (using NeonDB), with version control for database changes
- **Modern Interface:** Clean, chat-style design with automatic dark/light mode that adapts to your preference

---

## 🚀 Getting Started

### 1. What You'll Need

- Python 3.10 or newer
- Node.js 18 or newer
- A Google Gemini API key (get one for free at [Google AI Studio](https://makersuite.google.com/app/apikey))
- A PostgreSQL database (we recommend [NeonDB](https://neon.tech) for a free, cloud-based option)

### 2. Set Up Environment Variables

Create a `.env` file in the project root folder and add your credentials:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@your-database-url/dbname?sslmode=require
SECRET_KEY=create_a_random_secret_string_here
```

> 💡 **Tip:** To create a secure secret key, you can run this Python command: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### 3. Start the Backend Server

Open a terminal in the project root folder:

```bash
# Install Python packages
pip install -r requirements.txt

# Set up the database
alembic upgrade head

# Start the API server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

> Your API will be available at `http://localhost:8000`

### 4. Start the Frontend Application

Open a second terminal window:

```bash
cd frontend

# Install JavaScript packages
npm install

# Start the development server
npm run dev
```

> Your web application will be available at `http://localhost:5173`

---

## 💡 How to Use the Application

### Creating an Admin Account

To test the admin features, create a new account and include the word `"admin"` anywhere in the phone number field (for example: `admin123` or `987654admin3210`). This will automatically grant you admin privileges.

### Making Database Changes

If you need to add new fields to the database:

1. Update the models in `models_db.py`
2. Generate a migration: `alembic revision --autogenerate -m "describe your changes"`
3. Apply it: `alembic upgrade head`

---

## 🛠️ Technology Stack (Simplified)

### Frontend - What Users See and Interact With

- **React:** The core library that builds the user interface. It updates only the parts of the screen that change, making the app feel fast and responsive.
- **Vite:** The build tool that makes development quick. It instantly updates the browser when you make code changes and optimizes everything for production.
- **CSS:** Handles all styling with built-in dark/light mode support. The interface adapts automatically to your system preferences.

### Backend - The Engine Room

- **Python:** The programming language used for all backend logic, chosen for its simplicity and powerful AI libraries.
- **FastAPI:** The web framework that creates the API endpoints. It's fast, easy to use, and automatically generates documentation for all endpoints.
- **Uvicorn:** The server that runs the Python application and handles incoming requests.

### AI & Intelligence - The Brain

- **CrewAI:** The framework that orchestrates multiple AI agents to work together as a coordinated team, each with a specific role.
- **Google Gemini:** The AI model that actually reads and understands the customer messages. It's fast and great at following instructions.
- **LangChain:** The toolkit that helps the AI agents process information and format their responses.

### Database - Where Information Lives

- **PostgreSQL:** The database that stores all user accounts and inquiry records.
- **NeonDB:** The cloud service that hosts our database (free tier available).
- **SQLAlchemy:** The tool that lets us work with the database using Python code instead of writing raw SQL.
- **Alembic:** The version control system for our database structure—it safely applies updates without losing data.

### Security - Keeping Things Safe

- **JWT (JSON Web Tokens):** The secure "ticket" system that proves a user is logged in. Each request includes a token that verifies identity.
- **bcrypt:** The password encryption system that ensures even if someone gets access to the database, they can't read users' passwords.
- **CORS:** A security feature that ensures only our frontend application can communicate with our backend API.

---

Built with ❤️ by **Harshit Bhardwaj**
