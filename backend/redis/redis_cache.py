import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# Referência para get_redis — será atribuída pelo bridge (redis_service.py)
_get_redis_fn = None

def _set_get_redis(fn):
    """Chamado pelo bridge para injetar a referência de get_redis."""
    global _get_redis_fn
    _get_redis_fn = fn


async def _get_redis():
    """Wrapper interno para obter o cliente Redis."""
    if _get_redis_fn is None:
        raise RuntimeError("Redis não inicializado. _set_get_redis não foi chamado.")
    return await _get_redis_fn()


# Chave do contador atômico de IDs
COUNTER_KEY = "url:next_id"

# Prefixos de chaves Redis
URL_CACHE_PREFIX = "short:"
CLICKS_PREFIX = "clicks:"
CLICKS_DAILY_PREFIX = "clicks_daily:"   # Hash: data → contagem
CLICKS_HOURLY_PREFIX = "clicks_hourly:" # Hash: hora (0-23) → contagem

# Valor inicial do contador de IDs
URL_ID_START = int(os.getenv("URL_ID_START", "15000000"))


async def init_counter():
    """
    Inicializa o contador de IDs no Redis se ainda não existir.
    """
    r = await _get_redis()
    exists = await r.exists(COUNTER_KEY)
    if not exists:
        await r.set(COUNTER_KEY, URL_ID_START, nx=True)


async def get_next_id() -> int:
    """Obtém o próximo ID sequencial de forma atômica."""
    r = await _get_redis()
    return await r.incr(COUNTER_KEY)


async def cache_url(short_code: str, original_url: str):
    """Armazena o mapeamento short_code → original_url no cache Redis."""
    r = await _get_redis()
    await r.set(f"{URL_CACHE_PREFIX}{short_code}", original_url)


async def get_cached_url(short_code: str) -> str | None:
    """Busca a URL original no cache Redis pelo short_code."""
    r = await _get_redis()
    return await r.get(f"{URL_CACHE_PREFIX}{short_code}")


async def increment_clicks(short_code: str) -> int:
    """
    Incrementa cliques com tracking temporal.
    
    Atualiza 3 contadores atomicamente:
    1. Total de cliques (INCR)
    2. Cliques por dia (HINCRBY no hash com data como campo)
    3. Cliques por hora (HINCRBY no hash com hora como campo)
    """
    r = await _get_redis()
    now = datetime.now(timezone.utc)
    day_key = now.strftime("%Y-%m-%d")
    hour_key = str(now.hour)
    
    # Pipeline para executar tudo de uma vez (atômico)
    pipe = r.pipeline()
    pipe.incr(f"{CLICKS_PREFIX}{short_code}")
    pipe.hincrby(f"{CLICKS_DAILY_PREFIX}{short_code}", day_key, 1)
    pipe.hincrby(f"{CLICKS_HOURLY_PREFIX}{short_code}", hour_key, 1)
    results = await pipe.execute()
    
    return results[0]  # Total de cliques


async def get_click_count(short_code: str) -> int:
    """Retorna o total de cliques de um short_code."""
    r = await _get_redis()
    count = await r.get(f"{CLICKS_PREFIX}{short_code}")
    return int(count) if count else 0


async def get_daily_clicks(short_code: str) -> dict[str, int]:
    """
    Retorna cliques por dia: {"2026-02-18": 42, "2026-02-17": 15, ...}
    """
    r = await _get_redis()
    data = await r.hgetall(f"{CLICKS_DAILY_PREFIX}{short_code}")
    return {k: int(v) for k, v in data.items()} if data else {}


async def get_hourly_clicks(short_code: str) -> dict[str, int]:
    """
    Retorna cliques por hora do dia: {"0": 5, "14": 42, "22": 18, ...}
    """
    r = await _get_redis()
    data = await r.hgetall(f"{CLICKS_HOURLY_PREFIX}{short_code}")
    return {k: int(v) for k, v in data.items()} if data else {}


async def invalidate_url(short_code: str):
    """Remove um short_code do cache Redis e todos os seus contadores."""
    r = await _get_redis()
    await r.delete(
        f"{URL_CACHE_PREFIX}{short_code}",
        f"{CLICKS_PREFIX}{short_code}",
        f"{CLICKS_DAILY_PREFIX}{short_code}",
        f"{CLICKS_HOURLY_PREFIX}{short_code}",
    )
