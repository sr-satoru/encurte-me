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
from src.auth.recovery.recovery_routes import router as recovery_router
from src.redis_service import connect_redis, disconnect_redis, init_counter
from src.shortener.shortener_service import resolve_short_url
from prisma import Prisma
from contextlib import asynccontextmanager
from src.swagger import setup_swagger

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
setup_swagger(app)

import os
FRONTEND_URL = os.getenv("FRONTEND_URL")
DISABLE_REGISTRATION = os.getenv("DISABLE_REGISTRATION", "false").lower() == "true"

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:4200", # Padrão superpostiz se necessário
    ],
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
app.include_router(recovery_router)


async def _registration_is_open(db: Prisma) -> bool:
    """Retorna True se o registro está habilitado.
    Mesmo com DISABLE_REGISTRATION=true, permite o primeiro usuário."""
    if not DISABLE_REGISTRATION:
        return True
    count = await db.user.count()
    return count == 0


@app.get("/auth/can-register", tags=["Auth"])
async def can_register(db: Prisma = Depends(get_db)):
    """Informa se o cadastro de novos usuários está habilitado."""
    return {"register": await _registration_is_open(db)}

# --- Rotas de Autenticação ---

@app.post("/register", status_code=status.HTTP_201_CREATED, tags=["Auth"])
async def register(response: Response, user_data: UserRegister, db: Prisma = Depends(get_db)):
    """Cria um novo usuário e faz login automático."""
    # Verificar se registro está habilitado
    if not await _registration_is_open(db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registro de usuários está desabilitado"
        )

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

@app.post("/login", tags=["Auth"])
async def login(response: Response, login_data: UserLogin, db: Prisma = Depends(get_db)):
    """Autentica o usuário e define o cookie de sessão."""
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

@app.post("/logout", tags=["Auth"])
async def logout(response: Response):
    """Remove o cookie de autenticação."""
    clear_auth_cookie(response)
    return {"message": "Logout successful"}

@app.post("/change-password", tags=["Account"])
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

@app.get("/me", tags=["Account"])
async def read_users_me(email: str = Depends(get_current_user_email), db: Prisma = Depends(get_db)):
    """Retorna os dados do usuário autenticado."""
    user = await db.user.find_unique(where={"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "created_at": user.created_at}

@app.get("/health", tags=["System"])
async def health_check():
    """Verifica se a API e serviços estão operacionais."""
    return {"status": "ok"}


class DeleteAccountRequest(BaseModel):
    confirmation: str


@app.delete("/delete-account", tags=["Account"])
async def delete_account(
    data: DeleteAccountRequest,
    response: Response,
    email: str = Depends(get_current_user_email),
    db: Prisma = Depends(get_db),
):
    """
    Deleta a conta do usuário e todos os seus links.
    Exige que o campo 'confirmation' seja exatamente 'apagar'.
    """
    if data.confirmation.strip().lower() != "apagar":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmação inválida. Digite 'apagar' para confirmar.",
        )
    
    # 1. Buscar todos os links do usuário
    urls = await db.shortenedurl.find_many(where={"user_email": email})
    
    # 2. Limpar cache Redis de cada link
    from src.redis_service import invalidate_url
    for url in urls:
        await invalidate_url(url.short_code)
    
    # 3. Deletar todos os links do banco
    await db.shortenedurl.delete_many(where={"user_email": email})
    
    # 4. Deletar a conta do usuário
    await db.user.delete(where={"email": email})
    
    # 5. Limpar cookie de autenticação
    clear_auth_cookie(response)
    
    return {"message": "Conta deletada com sucesso"}

# --- Rota de Redirecionamento (DEVE ser a ÚLTIMA rota) ---
# Esta rota captura /{short_code} — por isso precisa vir depois de todas as outras

@app.get("/{short_code}", include_in_schema=False)
async def redirect_short_url(short_code: str, db: Prisma = Depends(get_db)):
    """Redireciona um short_code para a URL original."""
    original_url = await resolve_short_url(short_code, db)
    if original_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link não encontrado",
        )
    return RedirectResponse(url=original_url, status_code=status.HTTP_301_MOVED_PERMANENTLY)
