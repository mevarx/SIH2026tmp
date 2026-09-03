# Sovereign AI Workbench (SIH 2026 - Problem Statement SIH26117)

## Overview
**Sovereign AI Workbench** is a platform built for Smart India Hackathon 2026 (SIH26117). The project aims to provide a secure, modular, and extensible architecture combining AI agents, Retrieval-Augmented Generation (RAG), computer vision, sandboxed code execution, and security layer integrations.

---

## Project Structure

```text
DEMO-SIH26117/
├── apps/
│   ├── backend/         # FastAPI microservice architecture
│   │   ├── app/
│   │   │   ├── agent/    # Autonomous AI Agent logic
│   │   │   ├── api/      # REST API endpoints & routers
│   │   │   ├── models/   # AI/ML model integrations
│   │   │   ├── rag/      # Retrieval-Augmented Generation pipelines
│   │   │   ├── sandbox/  # Secure code execution sandbox environment
│   │   │   ├── schemas/  # Pydantic schemas & data validation
│   │   │   ├── security/ # Authentication & security controls
│   │   │   ├── tools/    # Agent tool call integrations
│   │   │   └── vision/   # Computer vision module handlers
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── frontend/        # Frontend UI Application
│       ├── src/
│       └── Dockerfile
├── configs/             # Configuration files and environment settings
├── docs/                # System documentation (Architecture, Security, Demo)
├── scripts/             # Deployment and build scripts
└── docker-compose.yml   # Container orchestration configuration
```

---

## Tech Stack

- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Frontend:** TypeScript, React (Vite / App pipeline)
- **Containerization & Orchestration:** Docker, Docker Compose

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js (v18+) & npm
- Docker & Docker Compose (optional for containerized deployment)

### Running Backend Locally

1. Navigate to the backend directory:
   ```bash
   cd apps/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. Access API Docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Health Check API

To verify backend health:
- **GET** `/api/health`
- **Response:** `{"status": "ok"}`
