# SafeRoute-AI 🛡️🗺️

> **Intelligent, safety-aware navigation and route optimization for pedestrians, commuters, and urban travelers.**

SafeRoute-AI is a hackathon-ready navigation platform engineered to calculate and suggest travel routes that prioritize personal safety over sheer speed. By synthesizing spatial features, street lighting data, crowd density indicators, historical incident patterns, and machine learning, SafeRoute-AI empowers users to travel with confidence.

---

## 🚀 Key Features

- **Safety-First Routing Engine:** Computes and compares alternative navigation routes evaluated against localized safety metrics.
- **Dynamic Safety Scoring:** Combines ambient lighting, temporal factors (day vs. night), crowd proximity, and historical safety records into an actionable score (0–100).
- **Incident & Hazard Reporting:** Allows community members to report hazards (e.g., non-working street lamps, blocked paths) to keep risk assessments up to date.
- **Decoupled Architecture:** Cleanly organized into independent Mobile Frontend, API Backend, and Machine Learning modules.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Mobile Frontend** | React Native, Expo, TypeScript | Cross-platform mobile UI (iOS, Android, Web) |
| **Navigation & UI** | React Navigation, React Native Maps | Map visualization, polyline overlays, screens |
| **Backend API** | FastAPI, Uvicorn (ASGI) | High-performance, asynchronous REST API |
| **Data Validation** | Pydantic v2 | Strict schema parsing and request verification |
| **Database & ORM** | SQLAlchemy, PostgreSQL (PostGIS) | Relational persistence and spatial operations |
| **Machine Learning** | Scikit-learn, Pandas, NumPy | Data cleaning, feature engineering, and inference |

---

## 📁 Project Directory Structure

```text
SafeRoute/
│
├── frontend/                     # React Native + Expo mobile client
│   ├── src/
│   │   ├── screens/              # UI application screens (Home, RouteDetails, etc.)
│   │   ├── components/           # Reusable UI widgets (SafetyCard, AlertBadge, etc.)
│   │   ├── maps/                 # Map overlays, markers, and polyline components
│   │   ├── services/             # API client, network calls, and geolocation logic
│   │   └── navigation/           # Stack and tab navigators
│   └── package.json              # Frontend package configuration and scripts
│
├── backend/                      # Python FastAPI service
│   ├── app/
│   │   ├── routes/               # API route definitions and controllers
│   │   ├── models/               # SQLAlchemy models and Pydantic schemas
│   │   ├── database/             # Database connection, sessions, and configurations
│   │   ├── services/             # Business logic (routing logic, ML orchestration)
│   │   └── main.py               # Main application entry point & CORS configuration
│   └── requirements.txt          # Python dependencies
│
├── ml/                           # Machine Learning modeling pipeline
│   ├── dataset/                  # Datasets directory (raw/cleaned CSV/GeoJSON)
│   ├── preprocessing.py          # Data ingestion, cleaning, and feature engineering
│   ├── train.py                  # Model training and evaluation script (with TODOs)
│   └── predict.py                # Safety score prediction and fallback inference logic
│
├── docs/                         # Technical documentation
│   └── API_DOCUMENTATION.md      # REST API schema and endpoint definitions
│
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore file for Node, Python, and Expo
└── README.md                     # Project overview and documentation
```

---

## 📂 Folder Responsibilities

- **`frontend/`**: Contains the mobile user interface built with React Native and Expo. It handles user interactions, queries the backend API, and renders interactive map views with highlighted safety zones.
- **`backend/`**: Contains the FastAPI REST service. It acts as the orchestration layer between the client, database, external mapping providers, and the ML prediction service.
- **`ml/`**: Houses all data science and machine learning workflows. It is responsible for preprocessing datasets, training models, and exporting prediction functions.
- **`docs/`**: Stores architecture diagrams, API specifications, and developer guides to keep the team aligned.

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Python 3.10+** (for Backend and ML)
- **Node.js 18+ & npm/yarn/pnpm** (for Mobile Frontend)
- **Git**

---

### 2. Backend Setup & Local Execution

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment:**
   - On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server with hot-reload:**
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. **Verify the server:**
   - Root endpoint: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   - Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - Interactive OpenAPI documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 3. Frontend Setup (When Ready to Build Mobile UI)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install packages (when ready):**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

---

### 4. Machine Learning Module Setup

1. **Place raw dataset in `ml/dataset/`** (e.g. `ml/dataset/safety_data.csv`).
2. **Run data preprocessing / feature verification:**
   ```bash
   python ml/preprocessing.py
   ```
3. **Run model training (once dataset is configured):**
   ```bash
   python ml/train.py
   ```
4. **Test the prediction module:**
   ```bash
   python ml/predict.py
   ```

---

## 🔒 Environment Configuration

Duplicate `.env.example` as `.env` and fill in any required local configuration:
```bash
cp .env.example .env
```
*(Never commit `.env` containing sensitive credentials to version control).*
