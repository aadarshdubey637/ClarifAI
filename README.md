# ClarifAI - AI-Powered Video Learning Platform

ClarifAI is a modern web application designed to enhance the learning experience from video lectures. It uses AI to transcribe, summarize, and answer questions based on video content, making learning more interactive and efficient.

## 🚀 Features

- **AI Chat**: Ask questions directly about the video content and get precise, context-aware answers.
- **Smart Summarization**: Get concise, insightful summaries and key takeaways from any lecture.
- **Interactive Transcript**: Navigate through the video using a synchronized, timestamped transcript.
- **YouTube Support**: Process both uploaded files and YouTube links.
- **Modern UI**: Clean, professional, and scannable interface optimized for learning.

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework.
- **SQLAlchemy**: SQL toolkit and ORM for database management.
- **PostgreSQL (Supabase)**: Cloud database for storing video metadata and transcripts.
- **Groq & Gemini**: Advanced AI models for lightning-fast transcription and reasoning.
- **Whisper**: High-accuracy speech-to-text processing.

### Frontend
- **React**: Modern UI library.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for a premium look.
- **Lucide React**: Beautifully simple pixel-perfect icons.

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/aadarshdubey637/ClarifAI.git
cd ClarifAI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```
- Create a `.env` file in the `backend` folder and add your keys (see `.env.example`).
- Run the database fix script: `python fix_db.py`
- Start the server: `uvicorn app.main:app --reload`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
- Create a `.env` file in the `frontend` folder:
  ```env
  VITE_API_URL=http://localhost:8000
  ```
- Start the development server: `npm run dev`

## 🌐 Hosting

- **Frontend**: Recommended on [Vercel](https://vercel.com).
- **Backend**: Recommended on [Render](https://render.com) or [Railway](https://railway.app).
- **Database**: Hosted on [Supabase](https://supabase.com).

## 📄 License
This project is for educational purposes.

---
Built with ❤️ by Aadarsh Dubey
