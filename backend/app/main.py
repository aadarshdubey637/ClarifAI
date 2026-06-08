import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, videos
from app.db.session import engine, Base
from app.models import user, video, transcript  # Ensure models are imported for Base.metadata

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
except Exception as e:
    print(f"Database table creation error: {e}")

app = FastAPI(title="ClarifAI Backend", version="1.0.0")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is live and reachable!"}

@app.get("/")
def read_root():
    return {"message": "Welcome to ClarifAI API"}

# Configure CORS
origins = [
    "https://clarifai-frontend-4l3q.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Make it fully open for now to debug
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve uploaded videos
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
