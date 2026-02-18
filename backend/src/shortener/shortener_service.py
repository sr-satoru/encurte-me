"""
Serviço Principal do Encurtador de URLs.

Orquestra toda a lógica de negócio:
- Criação de URLs encurtadas (ID sequencial → HashID → salvar)
- Resolução de URLs curtas (cache Redis → fallback banco)
- Métricas de cliques
- Deleção de URLs
"""

from prisma import Prisma
from src.shortener.id_generator import encode_id, decode_id
from src.redis_service import (
    get_next_id,
    cache_url,
    get_cached_url,
    increment_clicks,
    get_click_count,
    get_daily_clicks,
    get_hourly_clicks,
    invalidate_url,
)


async def create_short_url(
    original_url: str,
    name: str | None,
    user_email: str,
    db: Prisma,
) -> dict:
    """
    Cria uma nova URL encurtada.
    
    Fluxo:
    1. Redis INCR → próximo ID sequencial (atômico, sem duplicatas)
    2. HashID encode → short_code não-adivinhável
    3. Salvar no banco (Prisma)
    4. Cachear no Redis para redirecionamento rápido
    
    Returns:
        Dict com dados da URL criada incluindo o short_code
    """
    # 1. Obter próximo ID atômico do Redis
    numeric_id = await get_next_id()
    
    # 2. Codificar via HashID (determinístico, sem colisões)
    short_code = encode_id(numeric_id)
    
    # 3. Persistir no banco de dados
    url_record = await db.shortenedurl.create(
        data={
            "id": numeric_id,
            "short_code": short_code,
            "original_url": original_url,
            "name": name,
            "user_email": user_email,
        }
    )
    
    # 4. Cachear no Redis para redirecionamentos rápidos
    await cache_url(short_code, original_url)
    
    return {
        "id": url_record.id,
        "short_code": url_record.short_code,
        "original_url": url_record.original_url,
        "name": url_record.name,
        "clicks": 0,
        "created_at": url_record.created_at.isoformat(),
    }


async def resolve_short_url(short_code: str, db: Prisma) -> str | None:
    """
    Resolve um short_code para a URL original.
    
    Fluxo otimizado (Redis-only, sem consulta ao banco):
    1. Busca no Redis cache
    2. Incrementa cliques em background (não bloqueia o redirect)
    
    Returns:
        URL original ou None se não encontrado
    """
    # Redis-only lookup (sem fallback ao banco)
    original_url = await get_cached_url(short_code)
    
    if original_url is None:
        return None
    
    # Incrementar cliques em background (fire-and-forget)
    import asyncio
    asyncio.create_task(increment_clicks(short_code))
    
    return original_url


async def get_user_urls(user_email: str, db: Prisma) -> list[dict]:
    """
    Lista todas as URLs de um usuário com métricas de cliques do Redis.
    
    Returns:
        Lista de dicts com dados das URLs e cliques em tempo real
    """
    urls = await db.shortenedurl.find_many(
        where={"user_email": user_email},
        order={"created_at": "desc"},
    )
    
    result = []
    for url in urls:
        # Buscar cliques em tempo real do Redis
        clicks = await get_click_count(url.short_code)
        result.append({
            "id": url.id,
            "short_code": url.short_code,
            "original_url": url.original_url,
            "name": url.name,
            "clicks": clicks,
            "created_at": url.created_at.isoformat(),
        })
    
    return result


async def get_url_stats(short_code: str, user_email: str, db: Prisma) -> dict | None:
    """
    Retorna estatísticas detalhadas de uma URL.
    
    Returns:
        Dict com estatísticas ou None se não encontrado/não autorizado
    """
    url_record = await db.shortenedurl.find_unique(
        where={"short_code": short_code}
    )
    
    if url_record is None or url_record.user_email != user_email:
        return None
    
    clicks = await get_click_count(short_code)
    
    return {
        "id": url_record.id,
        "short_code": url_record.short_code,
        "original_url": url_record.original_url,
        "name": url_record.name,
        "clicks": clicks,
        "created_at": url_record.created_at.isoformat(),
        "updated_at": url_record.updated_at.isoformat(),
    }


async def delete_short_url(short_code: str, user_email: str, db: Prisma) -> bool:
    """
    Deleta uma URL encurtada (banco + cache).
    
    Verifica que o usuário é o dono antes de deletar.
    
    Returns:
        True se deletou, False se não encontrou ou não autorizado
    """
    url_record = await db.shortenedurl.find_unique(
        where={"short_code": short_code}
    )
    
    if url_record is None or url_record.user_email != user_email:
        return False
    
    # Deletar do banco
    await db.shortenedurl.delete(where={"short_code": short_code})
    
    # Invalidar cache Redis
    await invalidate_url(short_code)
    
    return True


async def update_short_url(
    short_code: str,
    user_email: str,
    db: Prisma,
    new_url: str | None = None,
    new_name: str | None = None,
) -> dict | None:
    """
    Atualiza uma URL encurtada (banco + cache Redis).
    
    Atualiza apenas os campos fornecidos (PATCH parcial).
    Se a URL de destino mudou, atualiza o cache Redis também.
    
    Returns:
        Dict com dados atualizados ou None se não encontrado/não autorizado
    """
    url_record = await db.shortenedurl.find_unique(
        where={"short_code": short_code}
    )
    
    if url_record is None or url_record.user_email != user_email:
        return None
    
    # Montar objeto de update apenas com campos fornecidos
    update_data = {}
    if new_url is not None:
        update_data["original_url"] = new_url
    if new_name is not None:
        update_data["name"] = new_name
    
    if not update_data:
        return None
    
    # Atualizar no banco
    updated = await db.shortenedurl.update(
        where={"short_code": short_code},
        data=update_data,
    )
    
    # Se a URL mudou, atualizar o cache Redis
    if new_url is not None:
        await cache_url(short_code, new_url)
    
    clicks = await get_click_count(short_code)
    
    return {
        "id": updated.id,
        "short_code": updated.short_code,
        "original_url": updated.original_url,
        "name": updated.name,
        "clicks": clicks,
        "created_at": updated.created_at.isoformat(),
    }


async def sync_clicks_to_db(user_email: str, db: Prisma) -> None:
    """
    Sincroniza cliques do Redis → banco de dados.
    
    Lê os contadores de cliques em tempo real do Redis e atualiza
    o campo 'clicks' no banco para cada URL do usuário.
    
    Chamado quando o usuário abre o dashboard para garantir
    que os dados persistidos estejam atualizados.
    """
    urls = await db.shortenedurl.find_many(
        where={"user_email": user_email},
    )
    
    for url in urls:
        clicks = await get_click_count(url.short_code)
        if clicks != url.clicks:
            await db.shortenedurl.update(
                where={"short_code": url.short_code},
                data={"clicks": clicks},
            )


async def get_dashboard_stats(user_email: str, db: Prisma) -> dict:
    """
    Retorna métricas agregadas do dashboard com dados temporais.
    
    Inclui cliques por dia e distribuição por hora para cada URL.
    """
    await sync_clicks_to_db(user_email, db)
    
    urls = await db.shortenedurl.find_many(
        where={"user_email": user_email},
        order={"created_at": "desc"},
    )
    
    total_clicks = 0
    url_stats = []
    # Agregar cliques por hora de todos os links
    all_hourly: dict[str, int] = {}
    
    for url in urls:
        clicks = await get_click_count(url.short_code)
        daily = await get_daily_clicks(url.short_code)
        hourly = await get_hourly_clicks(url.short_code)
        total_clicks += clicks
        
        # Agregar horários
        for h, c in hourly.items():
            all_hourly[h] = all_hourly.get(h, 0) + c
        
        url_stats.append({
            "id": url.id,
            "short_code": url.short_code,
            "original_url": url.original_url,
            "name": url.name or url.short_code,
            "clicks": clicks,
            "daily_clicks": daily,
            "hourly_clicks": hourly,
            "created_at": url.created_at.isoformat(),
        })
    
    return {
        "total_urls": len(urls),
        "total_clicks": total_clicks,
        "all_hourly": all_hourly,
        "urls": url_stats,
    }
