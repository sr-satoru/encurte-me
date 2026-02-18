"""
Cliente Redis Assíncrono.

Gerencia a conexão com o Redis para ser usada em toda a aplicação.
Utiliza redis.asyncio para operações não-bloqueantes com FastAPI.

Este módulo reside em redis/ mas é importado via src/redis_service.py
para evitar conflito com o pacote pip 'redis'.
"""

import os
import redis.asyncio as aioredis
from pathlib import Path
from dotenv import load_dotenv

# Carregar .env da raiz do projeto (redis/ → backend/ → raiz)
_ROOT_ENV = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_ROOT_ENV)

REDIS_URL = os.getenv("REDIS_URL")

# Instância global do cliente Redis
_redis_client: aioredis.Redis | None = None


async def connect_redis() -> aioredis.Redis:
    """Inicializa e retorna a conexão Redis."""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def disconnect_redis():
    """Fecha a conexão Redis."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None


async def get_redis() -> aioredis.Redis:
    """
    Dependency para FastAPI — retorna o cliente Redis conectado.
    Se ainda não conectado, conecta automaticamente.
    """
    global _redis_client
    if _redis_client is None:
        await connect_redis()
    return _redis_client
