import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt

# Monkey-patch bcrypt for passlib compatibility before importing passlib
try:
    import bcrypt
    if not hasattr(bcrypt, "__about__"):
        class DummyAbout:
            __version__ = bcrypt.__version__
        bcrypt.__about__ = DummyAbout()
except ImportError:
    pass

from passlib.context import CryptContext
import hashlib
from dotenv import load_dotenv

# Load env vars
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path)

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Update CryptContext to handle newer bcrypt versions or use a fallback
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Bcrypt ki 72-byte limit ko handle karne ke liye
    # Hum password ko hamesha truncate ya hash karenge agar wo lamba hai
    try:
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            # Agar password 72 chars se bada hai, to uska SHA256 hash use karein (64 chars)
            plain_password = hashlib.sha256(password_bytes).hexdigest()
        
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Auth Error: {e}")
        # Ek aur koshish: Agar pehle bina hash ke save hua tha aur ab humne hash kar diya
        # To ho sakta hai verification fail ho raha ho. 
        # Lekin current logs ke hisaab se bcrypt version ka issue zyada lag raha hai.
        return False

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password = hashlib.sha256(password_bytes).hexdigest()
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
