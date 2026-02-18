from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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
from src.auth.captcha import verify_captcha
from src.routes.url_routes import router as url_router
from src.redis_service import connect_redis, disconnect_redis, init_counter
from src.shortener.shortener_service import resolve_short_url
from prisma import Prisma
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    await connect_redis()
    await init_counter()
    yield
    # Shutdown
    await disconnect_redis()
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
    captcha_token: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    captcha_token: str | None = None

class UserChangePassword(BaseModel):
    current_password: str
    new_password: str

# --- Registrar Routers ---
app.include_router(url_router)

# --- Rotas de Autenticação ---

@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(response: Response, user_data: UserRegister, db: Prisma = Depends(get_db)):
    # Verificar reCAPTCHA
    await verify_captcha(user_data.captcha_token)
    
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
    # Verificar reCAPTCHA
    await verify_captcha(login_data.captcha_token)
    
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

@app.post("/change-password")
async def change_password(
    data: UserChangePassword, 
    email: str = Depends(get_current_user_email), 
    db: Prisma = Depends(get_db)
):
    user = await db.user.find_unique(where={"email": email})
    if not user or not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual incorreta",
        )
    
    new_hashed_password = get_password_hash(data.new_password)
    await db.user.update(
        where={"email": email},
        data={"password_hash": new_hashed_password}
    )
    
    return {"message": "Senha alterada com sucesso"}

@app.get("/me")
async def read_users_me(email: str = Depends(get_current_user_email), db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "created_at": user.created_at}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# --- Rota de Redirecionamento (DEVE ser a ÚLTIMA rota) ---
# Esta rota captura /{short_code} — por isso precisa vir depois de todas as outras

@app.get("/{short_code}")
async def redirect_short_url(short_code: str, db: Prisma = Depends(get_db)):
    """Redireciona um short_code para a URL original."""
    original_url = await resolve_short_url(short_code, db)
    if original_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link não encontrado",
        )
    return RedirectResponse(url=original_url, status_code=status.HTTP_301_MOVED_PERMANENTLY)
