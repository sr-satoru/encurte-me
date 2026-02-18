import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Request, HTTPException, status, Response
import src.config  # noqa: F401 — carrega .env da raiz


# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
COOKIE_NAME = os.getenv("COOKIE_NAME", "auth_token")

# Session Constants (Hardcoded as requested)
SESSION_DURATION_MINUTES = 7 * 24 * 60  # 7 days
MAX_SESSION_MINUTES = 30 * 24 * 60      # 30 days

import bcrypt

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str):
    return bcrypt.hashpw(
        password.encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    
    # Use 7 days default if no delta provided
    expire = now + (expires_delta or timedelta(minutes=SESSION_DURATION_MINUTES))
    
    to_encode.update({
        "exp": expire,
        "iat": now  # Issued at
    })
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def set_auth_cookie(response: Response, token: str):
    # Dynamic secure flag: True if we're not in a typical dev environment or if manually forced
    is_secure = os.getenv("NODE_ENV") == "production" or os.getenv("AUTH_SECURE_COOKIE") == "True"
    
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=SESSION_DURATION_MINUTES * 60,
        expires=SESSION_DURATION_MINUTES * 60,
    )

def clear_auth_cookie(response: Response):
    response.delete_cookie(key=COOKIE_NAME)

async def get_current_user_email(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        iat_timestamp = payload.get("iat")
        
        if email is None or iat_timestamp is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            
        # Sliding Session Logic
        now = datetime.now(timezone.utc)
        iat = datetime.fromtimestamp(iat_timestamp, tz=timezone.utc)
        
        # Calculate new expiration as now + 7 days
        new_expire = now + timedelta(minutes=SESSION_DURATION_MINUTES)
        # Cap it at 30 days from original iat
        max_expire = iat + timedelta(minutes=MAX_SESSION_MINUTES)
        
        if new_expire > max_expire:
            new_expire = max_expire
            
        # Only refresh if the session hasn't reached the 30-day hard limit
        if now < max_expire:
            # Issue a new token with same iat but updated exp
            new_token_data = {"sub": email, "iat": iat_timestamp}
            new_token = jwt.encode({**new_token_data, "exp": new_expire}, JWT_SECRET, algorithm=ALGORITHM)
            set_auth_cookie(response, new_token)
            
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
