import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
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
    # Truncate password to 72 bytes to avoid bcrypt limit
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Truncate password to 72 bytes to avoid bcrypt limit
    if len(password.encode('utf-8')) > 72:
        password = hashlib.sha256(password.encode('utf-8')).hexdigest()
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
