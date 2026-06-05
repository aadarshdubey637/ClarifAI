from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.session import Base
import datetime

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), unique=True)
    full_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to chunks
    chunks = relationship("TranscriptChunk", back_populates="transcript", cascade="all, delete-orphan")

class TranscriptChunk(Base):
    __tablename__ = "transcript_chunks"

    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"))
    text = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)  # in seconds
    end_time = Column(Float, nullable=False)    # in seconds

    transcript = relationship("Transcript", back_populates="chunks")
