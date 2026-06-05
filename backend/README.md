# Authentication APIs
- [main.py](file:///d:/ClarifAI/backend/app/main.py): Entry point with CORS and route registration.
- [auth.py](file:///d:/ClarifAI/backend/app/api/auth.py): Signup and Login endpoints logic.

# Database & Models
- [session.py](file:///d:/ClarifAI/backend/app/db/session.py): SQLAlchemy engine and session setup.
- [user.py](file:///d:/ClarifAI/backend/app/models/user.py): SQLAlchemy User model for PostgreSQL.
- [user.py](file:///d:/ClarifAI/backend/app/schemas/user.py): Pydantic schemas for data validation.

# Core Utilities
- [auth.py](file:///d:/ClarifAI/backend/app/core/auth.py): Password hashing and JWT token generation.

# Configurations
- [.env](file:///d:/ClarifAI/backend/.env): Database URL and secrets (Update your password here).
- [requirements.txt](file:///d:/ClarifAI/backend/requirements.txt): List of Python dependencies.

# How to Run
1. Navigate to backend: `cd backend`
2. Create Virtual Env: `python -m venv venv`
3. Activate: `.\venv\Scripts\activate` (Windows)
4. Install: `pip install -r requirements.txt`
5. Run: `uvicorn app.main:app --reload`
