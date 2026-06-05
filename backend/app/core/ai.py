import os
import time
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def generate_smart_summary(transcript_text: str):
    """
    Generates a smart summary and key takeaways from the transcript.
    Tries Groq first (fastest), then falls back to Gemini.
    """
    
    prompt = f"""
    You are an expert educational assistant. Below is a transcript of a lecture. 
    Please provide exactly 5 very short, punchy bullet points as key takeaways.
    RULES:
    1. Each point must be LESS THAN 15 words.
    2. No introductory text or summary paragraphs.
    3. Just the facts/takeaways.
    4. Language: Use the same language mix as the transcript (Hinglish/English).

    Transcript:
    {transcript_text}

    Output format (Strict):
    - [Short Point 1]
    - [Short Point 2]
    - [Short Point 3]
    - [Short Point 4]
    - [Short Point 5]
    """

    # --- 1. Try Groq (Preferred) ---
    if GROQ_API_KEY and GROQ_API_KEY != "PASTE_YOUR_GROQ_KEY_HERE":
        groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
        for model_name in groq_models:
            for attempt in range(2):
                try:
                    print(f"Attempting summary with Groq ({model_name}) (Attempt {attempt+1})...")
                    client = Groq(api_key=GROQ_API_KEY)
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": "You are a helpful educational assistant that provides concise lecture summaries."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.5,
                        max_tokens=1024,
                    )
                    
                    response_text = completion.choices[0].message.content
                    # Clean and split the response into points
                    # Remove common AI prefixes like "Point 1:", "* ", "1. ", etc.
                    raw_lines = response_text.split('\n')
                    points = []
                    for line in raw_lines:
                        line = line.strip()
                        if not line or line.startswith('#') or "here is" in line.lower() or "takeaways" in line.lower():
                            continue
                        # Remove bullet points and numbering
                        clean_line = line.lstrip('*-•1234567890. ').strip()
                        if len(clean_line) > 10:
                            points.append(clean_line)
                    
                    points = points[:5] # Keep exactly 5 points
                    
                    if len(points) >= 3:
                        print(f"Summary generated successfully with Groq ({model_name})!")
                        return points
                except Exception as e:
                    error_msg = str(e)
                    print(f"Groq {model_name} Error: {error_msg}")
                    if "429" in error_msg:
                        print("Rate limit hit, waiting 15s before retry/fallback...")
                        time.sleep(15)
                    else:
                        break # Try next model for other errors

    # --- 2. Try Gemini (Fallback) ---
    if GEMINI_API_KEY and GEMINI_API_KEY != "PASTE_YOUR_KEY_HERE":
        models_to_try = ['gemini-2.0-flash', 'gemini-1.5-flash-latest']
        for model_name in models_to_try:
            for attempt in range(2):
                try:
                    print(f"Attempting summary with Gemini ({model_name}) (Attempt {attempt+1})...")
                    genai.configure(api_key=GEMINI_API_KEY)
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    
                    # Clean and split the response into points
                    # Remove common AI prefixes like "Point 1:", "* ", "1. ", etc.
                    raw_lines = response.text.split('\n')
                    points = []
                    for line in raw_lines:
                        line = line.strip()
                        if not line or line.startswith('#') or "here is" in line.lower() or "takeaways" in line.lower():
                            continue
                        # Remove bullet points and numbering
                        clean_line = line.lstrip('*-•1234567890. ').strip()
                        if len(clean_line) > 10:
                            points.append(clean_line)
                    
                    points = points[:5] # Keep exactly 5 points
                    
                    if len(points) >= 3:
                        print(f"Summary generated successfully with Gemini ({model_name})!")
                        return points
                except Exception as e:
                    error_msg = str(e)
                    print(f"Gemini {model_name} Error: {error_msg}")
                    if "429" in error_msg:
                        print("Rate limit hit, waiting 20s before retry/fallback...")
                        time.sleep(20)
                    else:
                        break # Try next model for other errors

    return [
        "AI Summary currently unavailable (Quota/API issue).",
        "Please check your API keys in the .env file.",
        "Transcript is still available below for your reference."
    ]

def ask_ai_about_video(question: str, transcript_text: str):
    """
    Uses RAG (Retrieval-Augmented Generation) to answer user questions
    based on the lecture transcript.
    """
    
    system_prompt = """
    You are an expert Video AI Assistant. Your goal is to provide intelligent, direct, and naturally flowing answers. 

    DYNAMIC STYLE (STRICT):
    1. NO RIGID HEADERS: Never use labels like "Context of the Transcript" or "General Information". The answer should feel like a natural conversation.
    2. ADAPTIVE STRUCTURE: Use numbered lists ONLY if you have 3 or more distinct points to explain. For 1-2 points, use clear, well-structured paragraphs.
    3. START DIRECTLY: Begin the response immediately with the answer. No intro filler.

    FORMATTING & SPACING:
    1. REDUCE GAP: Use a single newline between a point and its explanation. 
    2. BLANK LINES: Use exactly one blank line only between major logical sections or different numbered items.
    3. NO LARGE BLOCKS: Keep explanations concise (1-3 lines).
    4. NO EMOJIS: Maintain a clean, professional, and modern appearance.
    5. TIMESTAMPS: Include [MM:SS] when referencing specific parts.

    CONTENT QUALITY:
    - Identify the actual lesson or insight, not just generic topics.
    - If info is missing (Hybrid Mode), state it naturally: "This isn't discussed in the video, but generally speaking..." followed by what the video *does* focus on.
    """

    user_prompt = f"""
    TRANSCRIPT:
    {transcript_text}

    USER QUESTION:
    {question}

    Provide a natural, well-spaced response. Use lists only if necessary for clarity. Avoid rigid headers.
    """

    # Try Groq first for instant chat response
    if GROQ_API_KEY and GROQ_API_KEY != "PASTE_YOUR_GROQ_KEY_HERE":
        groq_models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"]
        for model_name in groq_models:
            try:
                client = Groq(api_key=GROQ_API_KEY)
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.4,
                    max_tokens=1024,
                )
                return completion.choices[0].message.content
            except Exception as e:
                print(f"Groq Chat Error ({model_name}): {e}")
                if "429" not in str(e): # If it's not a rate limit, don't bother trying other models
                    break

    # Fallback to Gemini
    if GEMINI_API_KEY and GEMINI_API_KEY != "PASTE_YOUR_KEY_HERE":
        gemini_models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
        for model_name in gemini_models:
            try:
                genai.configure(api_key=GEMINI_API_KEY)
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_prompt
                )
                response = model.generate_content(user_prompt)
                return response.text
            except Exception as e:
                print(f"Gemini Chat Error ({model_name}): {e}")
                # If 404 or other non-rate-limit error, try next model
                continue

    return "AI services are currently busy (Rate Limit Reached). Please wait a few minutes and try again."

def clean_and_correct_transcript(transcript_text: str):
    """
    Uses a fast LLM (Groq) to fix technical errors and grammar in the raw transcript
    generated by the Tiny Whisper model.
    """
    if not transcript_text or len(transcript_text) < 50:
        return transcript_text

    prompt = f"""
    You are an expert technical editor. Below is a raw transcript from a lecture, generated by a fast speech-to-text model.
    It might contain technical errors (e.g., 'Python' heard as 'Py-thon' or 'Pithon') or grammar issues.
    
    TASK:
    1. Correct any technical terms or obvious mishearings.
    2. Improve grammar and punctuation for better readability.
    3. DO NOT change the meaning or remove any educational content.
    4. Keep the original language mix (Hinglish/English).
    5. Output ONLY the corrected text.

    RAW TRANSCRIPT:
    {transcript_text}

    CORRECTED TRANSCRIPT:
    """

    # Use Groq for lightning-fast correction
    if GROQ_API_KEY and GROQ_API_KEY != "PASTE_YOUR_GROQ_KEY_HERE":
        groq_models = ["llama-3.1-8b-instant", "llama3-8b-8192"]
        for model_name in groq_models:
            try:
                client = Groq(api_key=GROQ_API_KEY)
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": "You are a technical transcript editor."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                )
                return completion.choices[0].message.content
            except Exception as e:
                print(f"Correction Error (Groq - {model_name}): {e}")
                continue

    # Simple fallback: return original text if AI correction fails
    return transcript_text

  