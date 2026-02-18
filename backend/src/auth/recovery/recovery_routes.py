"""
Rotas de recuperação de senha.

POST /auth/forgot-password — solicita recuperação (envia email)
POST /auth/reset-password  — redefine a senha com token válido
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from prisma import Prisma

from src.database.db import get_db
from src.auth.auth import get_password_hash
from src.auth.recovery.recovery_service import generate_recovery_token, consume_recovery_token
from src.auth.recovery.email_service import send_recovery_email

router = APIRouter(prefix="/auth", tags=["recovery"])


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Prisma = Depends(get_db)):
    """
    Solicita recuperação de senha.
    
    - Verifica se o email existe no banco
    - Gera token com TTL de 10 minutos
    - Envia email com link de recuperação
    
    Sempre retorna 200 para não expor se o email existe ou não (segurança).
    """
    # Sempre retorna sucesso para não expor se o email existe
    user = await db.user.find_unique(where={"email": data.email})
    
    if user:
        token = await generate_recovery_token(data.email)
        await send_recovery_email(data.email, token)
    
    return {
        "message": "Se o email estiver cadastrado, você receberá um link de recuperação."
    }


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Prisma = Depends(get_db)):
    """
    Redefine a senha usando o token de recuperação.
    
    - Valida e consome o token (uso único)
    - Atualiza a senha no banco
    """
    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ter pelo menos 6 caracteres.",
        )
    
    email = await consume_recovery_token(data.token)
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado. Solicite um novo link.",
        )
    
    # Atualizar senha no banco
    new_hash = get_password_hash(data.new_password)
    await db.user.update(
        where={"email": email},
        data={"password_hash": new_hash},
    )
    
    return {"message": "Senha redefinida com sucesso. Faça login com sua nova senha."}
