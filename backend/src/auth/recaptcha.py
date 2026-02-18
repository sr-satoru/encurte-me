"""
Verificação de Google reCAPTCHA v2 Invisible.

Valida o token reCAPTCHA enviado pelo frontend
contra a API do Google para prevenir bots.

Uso:
    from src.auth.recaptcha import verify_recaptcha
    await verify_recaptcha(token)  # raises HTTPException se falhar
"""

import os
import httpx
from fastapi import HTTPException, status
import src.config  # noqa: F401 — carrega .env da raiz


RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


async def verify_recaptcha(token: str | None) -> bool:
    """
    Verifica um token reCAPTCHA contra a API do Google.
    
    Returns:
        True se válido
    Raises:
        HTTPException 400 se token ausente ou inválido
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reCAPTCHA não preenchido",
        )
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            RECAPTCHA_VERIFY_URL,
            data={
                "secret": RECAPTCHA_SECRET_KEY,
                "response": token,
            },
        )
    
    result = resp.json()
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verificação reCAPTCHA falhou. Tente novamente.",
        )
    
    return True
