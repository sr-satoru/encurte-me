"""
Serviço de geração e validação de tokens de recuperação de senha.

Tokens são armazenados no Redis com TTL de 10 minutos.
Formato: recovery:token:{token} → email
"""

import os
import secrets
from src.redis_service import get_redis
import src.config  # noqa: F401

RECOVERY_PREFIX = "recovery:token:"
RECOVERY_TTL = 60 * 10  # 10 minutos em segundos


async def generate_recovery_token(email: str) -> str:
    """
    Gera um token seguro e armazena no Redis com TTL de 10 minutos.
    
    Se já existe um token para este email, é substituído.
    
    Returns:
        Token gerado (URL-safe, 48 chars)
    """
    token = secrets.token_urlsafe(36)
    r = await get_redis()
    
    # Armazenar token → email no Redis com TTL
    await r.setex(
        f"{RECOVERY_PREFIX}{token}",
        RECOVERY_TTL,
        email,
    )
    
    return token


async def validate_recovery_token(token: str) -> str | None:
    """
    Valida um token de recuperação.
    
    Returns:
        Email associado ao token, ou None se inválido/expirado
    """
    r = await get_redis()
    email = await r.get(f"{RECOVERY_PREFIX}{token}")
    
    if email is None:
        return None
    
    return email


async def consume_recovery_token(token: str) -> str | None:
    """
    Valida e consome (apaga) um token de recuperação.
    Garante uso único do token.
    
    Returns:
        Email associado ao token, ou None se inválido/expirado
    """
    r = await get_redis()
    key = f"{RECOVERY_PREFIX}{token}"
    
    # GET + DELETE atomicamente via pipeline
    pipe = r.pipeline()
    pipe.get(key)
    pipe.delete(key)
    results = await pipe.execute()
    
    email = results[0]
    return email if email else None
