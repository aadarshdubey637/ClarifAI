from sqlalchemy import Column, Integer, String, DateTime
from app.db.session import Base
import datetime

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    file_path = Column(String, nullable=False)  # Path to the stored file
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="uploaded")  # uploaded, processing, transcript_generating, transcript_completed, failed
    progress_percentage = Column(Integer, default=0)
    current_chunk = Column(String, nullable=True) # Real-time processing text
    # Future-proofing for AI features
    transcript = Column(String, nullable=True)
    summary = Column(String, nullable=True)
