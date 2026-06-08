import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, videos
from app.db.session import engine, Base
from app.models import user, video, transcript

# Initialize FastAPI
app = FastAPI(title="ClarifAI Backend", version="1.0.0")

# 1. VERY SIMPLE ROUTES FIRST
@app.get("/")
async def root():
    return {"message": "ClarifAI API is Running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/health")
async def api_health():
    return {"status": "ok", "context": "api"}

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. DB TABLES
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables synchronized.")
except Exception as e:
    print(f"DB Error: {e}")

# 4. STATIC FILES
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 5. ROUTERS
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
