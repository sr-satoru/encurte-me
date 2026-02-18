from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from src.database.db import connect_db, disconnect_db, get_db
from src.auth.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    set_auth_cookie, 
    clear_auth_cookie,
    get_current_user_email
)
from prisma import Prisma
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()

app = FastAPI(title="URL Shortener Backend", lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Routes
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(response: Response, user_data: UserRegister, db: Prisma = Depends(get_db)):
    # Check if user exists
    existing_user = await db.user.find_unique(where={"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    user = await db.user.create(
        data={
            "email": user_data.email,
            "password_hash": hashed_password,
            "name": user_data.name
        }
    )
    
    # Auto-login: set cookie
    access_token = create_access_token(data={"sub": user.email})
    set_auth_cookie(response, access_token)
    
    return {
        "message": "User created successfully", 
        "user": {"email": user.email, "name": user.name}
    }

@app.post("/login")
async def login(response: Response, login_data: UserLogin, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"email": login_data.email})
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": user.email})
    set_auth_cookie(response, access_token)
    
    return {"message": "Login successful", "user": {"email": user.email, "name": user.name}}

@app.post("/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logout successful"}

@app.get("/me")
async def read_users_me(email: str = Depends(get_current_user_email), db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "created_at": user.created_at}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
