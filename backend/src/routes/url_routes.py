"""
Rotas da API para o Encurtador de URLs.

Endpoints autenticados para CRUD de URLs:
- POST   /urls                      — Criar URL encurtada
- GET    /urls                      — Listar URLs do usuário
- GET    /urls/dashboard            — Métricas agregadas (sync Redis→DB)
- GET    /urls/resolve/{short_code} — Resolver URL (JSON, para frontend)
- PATCH  /urls/{short_code}         — Atualizar URL (nome e/ou destino)
- DELETE /urls/{short_code}         — Deletar URL
- GET    /urls/{short_code}/stats   — Métricas de cliques

IMPORTANTE: Rotas com path fixo (dashboard, resolve) DEVEM vir ANTES
das rotas com path param ({short_code}) para evitar conflito no FastAPI.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from prisma import Prisma
from src.database.db import get_db
from src.auth.auth import get_current_user_email
from src.shortener.shortener_service import (
    create_short_url,
    get_user_urls,
    get_url_stats,
    delete_short_url,
    update_short_url,
    get_dashboard_stats,
    resolve_short_url,
)

router = APIRouter(prefix="/urls", tags=["urls"])


# --- Modelos de Request ---

class CreateUrlRequest(BaseModel):
    url: str
    name: str | None = None

class UpdateUrlRequest(BaseModel):
    url: str | None = None
    name: str | None = None


# --- Rotas com path FIXO (devem vir primeiro) ---

@router.post("", status_code=status.HTTP_201_CREATED)
async def api_create_url(
    data: CreateUrlRequest,
    email: str = Depends(get_current_user_email),
    db: Prisma = Depends(get_db),
):
    """Cria uma nova URL encurtada."""
    result = await create_short_url(
        original_url=str(data.url),
        name=data.name,
        user_email=email,
        db=db,
    )
    return result


@router.get("")
async def api_list_urls(
    email: str = Depends(get_current_user_email),
    db: Prisma = Depends(get_db),
):
    """Lista todas as URLs do usuário autenticado."""
    urls = await get_user_urls(user_email=email, db=db)
    return {"urls": urls}


@router.get("/dashboard")
async def api_dashboard(
    email: str = Depends(get_current_user_email),
    db: Prisma = Depends(get_db),
):
    """Retorna métricas agregadas do dashboard. Faz sync Redis→DB automaticamente."""
    stats = await get_dashboard_stats(user_email=email, db=db)
    return stats


@router.get("/resolve/{short_code}")
async def api_resolve_url(
    short_code: str,
    db: Prisma = Depends(get_db),
):
    """Resolve um short_code e retorna a URL original como JSON (para o frontend redirecionar)."""
    original_url = await resolve_short_url(short_code, db)
    if original_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link não encontrado",
        )
    return {"original_url": original_url}


# --- Rotas com path PARAM ({short_code}) — devem vir DEPOIS ---

@router.get("/{short_code}/stats")
async def api_url_stats(
    short_code: str,
    email: str = Depends(get_current_user_email),
    db: Prisma = Depends(get_db),
):
    """Retorna métricas detalhadas de uma URL."""
    stats = await get_url_stats(
        short_code=short_code,
        user_email=email,
        db=db,
    )
    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL não encontrada",
        )
    return stats


@router.patch("/{short_code}")
async def api_update_url(
    short_code: str,
    data: UpdateUrlRequest,
    email: str = Depends(get_current_user_email),
    db: Prisma = Depends(get_db),
):
    """Atualiza uma URL encurtada (nome e/ou destino). Atualiza cache Redis."""
    updated = await update_short_url(
        short_code=short_code,
        user_email=email,
        db=db,
        new_url=data.url,
        new_name=data.name,
    )
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL não encontrada ou sem permissão",
        )
    return updated


@router.delete("/{short_code}", status_code=status.HTTP_200_OK)
async def api_delete_url(
    short_code: str,
    email: str = Depends(get_current_user_email),
    db: Prisma = Depends(get_db),
):
    """Deleta uma URL encurtada."""
    deleted = await delete_short_url(
        short_code=short_code,
        user_email=email,
        db=db,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL não encontrada ou sem permissão",
        )
    return {"message": "URL deletada com sucesso"}
