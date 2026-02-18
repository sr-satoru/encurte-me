"""
Verificação de Cloudflare Turnstile.

Valida o token Turnstile enviado pelo frontend
contra a API da Cloudflare para prevenir bots.

Turnstile é a alternativa gratuita e privacy-first da Cloudflare
ao Google reCAPTCHA. Não usa cookies de tracking.

Uso:
    from src.auth.cloudflare import verify_turnstile
    await verify_turnstile(token)  # raises HTTPException se falhar
"""

import os
import httpx
from fastapi import HTTPException, status
import src.config  # noqa: F401 — carrega .env da raiz


TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY")
TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(token: str | None) -> bool:
    """
    Verifica um token Turnstile contra a API da Cloudflare.
    
    Returns:
        True se válido
    Raises:
        HTTPException 400 se token ausente ou inválido
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verificação Turnstile não preenchida",
        )
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TURNSTILE_VERIFY_URL,
            json={
                "secret": TURNSTILE_SECRET_KEY,
                "response": token,
            },
        )
    
    result = resp.json()
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verificação Turnstile falhou. Tente novamente.",
        )
    
    return True
