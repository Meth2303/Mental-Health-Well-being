from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import bcrypt

from database import get_db
from models import User

load_dotenv()

# Security configurations
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing
# Prefer bcrypt_sha256 to avoid the 72-byte limitation in raw bcrypt
# bcrypt_sha256 hashes the password with SHA-256 before applying bcrypt
# Use PBKDF2-SHA256 as the preferred hasher to avoid native bcrypt backend issues on some systems
# PBKDF2-SHA256 is secure and avoids the 72-byte bcrypt limitation and any bcrypt backend detection errors
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt_sha256", "bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash.

    Uses passlib's CryptContext by default but falls back to the bcrypt
    library directly when passlib's bcrypt backend fails (this can happen
    when the installed `bcrypt` implementation is missing version metadata
    or when passlib's backend detection misbehaves). Also safely truncates
    the password to 72 bytes prior to using the bcrypt library which
    enforces a 72-byte maximum.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to bcrypt.checkpw directly
        try:
            pw = plain_password.encode("utf-8")
            if len(pw) > 72:
                pw = pw[:72]
            return bcrypt.checkpw(pw, hashed_password.encode("utf-8"))
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    """Generate hash for a password"""
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback to bcrypt library directly (ensure truncation to 72 bytes)
        pw = password.encode("utf-8")
        if len(pw) > 72:
            pw = pw[:72]
        hashed = bcrypt.hashpw(pw, bcrypt.gensalt())
        return hashed.decode("utf-8")

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password"""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return {"username": username}
    except JWTError:
        return None

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token)
    if token_data is None:
        raise credentials_exception
    
    user = get_user_by_username(db, username=token_data["username"])
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user