import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL")

def fix_database():
    print(f"Connecting to database...")
    # Add sslmode=require for Supabase
    engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})
    
    with engine.connect() as conn:
        print("Adding missing columns to 'videos' table...")
        try:
            # Add status column
            conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'uploaded';"))
            # Add progress_percentage column
            conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;"))
            # Add current_chunk column for real-time display
            conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS current_chunk TEXT;"))
            # Add transcript column
            conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS transcript TEXT;"))
            # Add summary column
            conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS summary TEXT;"))
            # Add progress_percentage column
            conn.execute(text("ALTER TABLE videos ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;"))
            
            # Create transcripts table if not exists
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS transcripts (
                    id SERIAL PRIMARY KEY,
                    video_id INTEGER UNIQUE REFERENCES videos(id),
                    full_text TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            
            # Create transcript_chunks table if not exists
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS transcript_chunks (
                    id SERIAL PRIMARY KEY,
                    transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
                    text TEXT NOT NULL,
                    start_time FLOAT NOT NULL,
                    end_time FLOAT NOT NULL
                );
            """))
            
            conn.commit()
            print("Successfully updated database schema!")
        except Exception as e:
            print(f"Error updating database: {e}")

if __name__ == "__main__":
    fix_database()
