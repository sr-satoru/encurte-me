"""
Bridge de importação para os módulos do diretório redis/.

O diretório redis/ não tem __init__.py (para evitar conflito com o
pacote pip 'redis'), então este módulo carrega os arquivos redis_client.py
e redis_cache.py por caminho de arquivo usando importlib.

Uso em todo o projeto:
    from src.redis_service import connect_redis, disconnect_redis, get_redis
    from src.redis_service import init_counter, get_next_id, cache_url, ...
"""

import importlib.util
from pathlib import Path

# Diretório onde estão os módulos Redis
_REDIS_DIR = Path(__file__).resolve().parent.parent / "redis"


def _load_module(name: str, filepath: Path):
    """Carrega um módulo Python a partir de um caminho de arquivo."""
    spec = importlib.util.spec_from_file_location(name, filepath)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Carregar redis_client primeiro
_redis_client_mod = _load_module("_redis_client", _REDIS_DIR / "redis_client.py")

# Carregar redis_cache e injetar get_redis
_redis_cache_mod = _load_module("_redis_cache", _REDIS_DIR / "redis_cache.py")
_redis_cache_mod._set_get_redis(_redis_client_mod.get_redis)

# Re-exportar funções do redis_client
connect_redis = _redis_client_mod.connect_redis
disconnect_redis = _redis_client_mod.disconnect_redis
get_redis = _redis_client_mod.get_redis

# Re-exportar funções do redis_cache
init_counter = _redis_cache_mod.init_counter
get_next_id = _redis_cache_mod.get_next_id
cache_url = _redis_cache_mod.cache_url
get_cached_url = _redis_cache_mod.get_cached_url
increment_clicks = _redis_cache_mod.increment_clicks
get_click_count = _redis_cache_mod.get_click_count
get_daily_clicks = _redis_cache_mod.get_daily_clicks
get_hourly_clicks = _redis_cache_mod.get_hourly_clicks
invalidate_url = _redis_cache_mod.invalidate_url
