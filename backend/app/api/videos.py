from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.models.video import Video
from app.models.transcript import Transcript, TranscriptChunk
import os
import shutil
import uuid
import subprocess
from datetime import datetime
from app.core.ai import generate_smart_summary, ask_ai_about_video, clean_and_correct_transcript, transcribe_audio_with_groq
import json
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

# Local storage paths
UPLOAD_DIR = "uploads"
AUDIO_DIR = "uploads/audio"
for d in [UPLOAD_DIR, AUDIO_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

def process_video_background(video_id: int):
    """Background task to extract audio and generate transcript using Groq"""
    db = SessionLocal()
    print(f"--- Starting Background Processing for Video ID: {video_id} ---")
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            print(f"Error: Video with ID {video_id} not found in database.")
            return

        # 1. Update status to processing
        print("Step 1: Updating status to 'processing'...")
        video.status = "processing"
        video.progress_percentage = 10
        db.commit()

        # 2. Extract Audio
        print(f"Step 2: Extracting audio from {video.file_path}...")
        video.progress_percentage = 20
        db.commit()
        
        abs_video_path = os.path.abspath(video.file_path)
        audio_filename = f"{uuid.uuid4()}.mp3"
        audio_path = os.path.abspath(os.path.join(AUDIO_DIR, audio_filename))
        
        try:
            if not os.path.exists(abs_video_path):
                raise FileNotFoundError(f"Video file not found at: {abs_video_path}")
            
            # Optimized FFmpeg command for Speed:
            # -b:a 32k: Very low bitrate (Fastest extraction, enough for AI)
            command = [
                'ffmpeg', '-i', abs_video_path,
                '-vn', '-ac', '1', '-ar', '16000', '-b:a', '32k', '-y',
                audio_path
            ]
            
            process = subprocess.run(command, capture_output=True, text=True)
            if process.returncode != 0:
                raise Exception(f"FFmpeg error: {process.stderr}")
                
            print(f"Audio extracted successfully: {audio_path}")
            video.progress_percentage = 40
            db.commit()
        except Exception as e:
            video.status = "failed"
            db.commit()
            print(f"Critical Error during Audio extraction: {str(e)}")
            return

        # 3. Update status to transcript_generating
        print("Step 3: Updating status to 'transcript_generating'...")
        video.status = "transcript_generating"
        video.progress_percentage = 50
        db.commit()

        # 4. Generate Transcript with Groq Whisper (Cloud)
        print("Step 4: Generating transcript using Groq Cloud AI...")
        try:
            full_text = transcribe_audio_with_groq(audio_path)
            
            if not full_text:
                raise Exception("Transcription failed or returned empty text")
                
            print(f"Transcription complete! Total characters: {len(full_text)}")
            
            video.progress_percentage = 80
            db.commit()

            # 5. Save Transcript
            print("Step 5: Saving transcript to database...")
            
            new_transcript = Transcript(
                video_id=video.id,
                full_text=full_text
            )
            db.add(new_transcript)
            db.flush()

            # 6. Save Transcript Chunks (Simple sentence splitting for now)
            # In a production app, we would use Groq's timestamped output
            sentences = full_text.split('. ')
            for i, sent in enumerate(sentences):
                chunk = TranscriptChunk(
                    transcript_id=new_transcript.id,
                    text=sent.strip(),
                    start_time=i * 5.0, # Estimated timestamps
                    end_time=(i + 1) * 5.0
                )
                db.add(chunk)

            video.transcript = full_text
            video.progress_percentage = 90
            db.commit()

            # 8. Generate Smart Summary with AI
            print("Step 8: Generating smart summary using AI...")
            video.status = "summarizing"
            db.commit()
            
            try:
                summary_points = generate_smart_summary(full_text)
                video.summary = json.dumps(summary_points)
                print("Smart summary generated successfully!")
            except Exception as ai_e:
                print(f"Error during AI summary generation: {ai_e}")
                video.summary = json.dumps(["Summary could not be generated at this time."])

            # 9. Final Update
            video.status = "transcript_completed"
            video.progress_percentage = 100
            db.commit()

            print(f"--- Processing Completed Successfully for Video ID: {video_id} ---")

        except Exception as e:
            video.status = "failed"
            db.commit()
            print(f"Critical Error during Transcription: {e}")
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)
                print(f"Cleaned up temporary audio file: {audio_path}")

    except Exception as e:
        print(f"Unexpected Backend Error: {e}")
    finally:
        db.close()

    except Exception as e:
        print(f"Unexpected Backend Error: {e}")
    finally:
        db.close()

@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Validate file type
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    # 2. Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 3. Save file locally
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # 4. Save metadata
    try:
        new_video = Video(
            title=file.filename,
            file_path=file_path,
            upload_date=datetime.utcnow(),
            status="uploaded"
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        
        # 5. Start background processing
        background_tasks.add_task(process_video_background, new_video.id)

        return {
            "id": new_video.id,
            "title": new_video.title,
            "status": new_video.status,
            "message": "Video uploaded. Processing started in background."
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/")
async def get_videos(db: Session = Depends(get_db)):
    """List all uploaded videos"""
    videos = db.query(Video).order_by(Video.upload_date.desc()).all()
    return videos

@router.get("/{video_id}")
async def get_video(video_id: int, db: Session = Depends(get_db)):
    """Get a single video by ID"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@router.get("/{video_id}/transcript")
async def get_video_transcript(video_id: int, db: Session = Depends(get_db)):
    """Get the transcript and chunks for a video"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    transcript = db.query(Transcript).filter(Transcript.video_id == video_id).first()
    if not transcript:
        return {
            "video_id": video_id,
            "status": video.status,
            "transcript": None,
            "summary": [],
            "chunks": []
        }
    
    return {
        "video_id": video_id,
        "full_text": transcript.full_text,
        "summary": json.loads(video.summary) if video.summary else [],
        "chunks": [
            {
                "text": chunk.text,
                "start_time": chunk.start_time,
                "end_time": chunk.end_time
            } for chunk in transcript.chunks
        ]
    }

@router.post("/{video_id}/chat")
async def chat_with_video(video_id: int, request: ChatRequest, db: Session = Depends(get_db)):
    """Ask AI a question about a specific video based on its transcript"""
    # 1. Get video and transcript
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    transcript = db.query(Transcript).filter(Transcript.video_id == video_id).first()
    if not transcript or not transcript.full_text:
        raise HTTPException(status_code=400, detail="Transcript not available yet. Please wait for processing to complete.")

    # 2. Get AI response using RAG logic
    try:
        response = ask_ai_about_video(request.question, transcript.full_text)
        return {"answer": response}
    except Exception as e:
        print(f"Chat API Error: {e}")
        raise HTTPException(status_code=500, detail="AI Assistant is having trouble answering. Please try again later.")

