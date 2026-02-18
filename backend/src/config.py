"""
Configuração centralizada — carrega o .env da raiz do projeto.

Todos os módulos devem importar este arquivo em vez de chamar 
load_dotenv() diretamente.

Uso:
    from src.config import ROOT_DIR, ENV_PATH
    # ou simplesmente:
    import src.config  # carrega o .env automaticamente
"""

from pathlib import Path
from dotenv import load_dotenv

# Raiz do projeto (2 níveis acima: src/config.py → src/ → backend/ → raiz)
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = ROOT_DIR / ".env"

# Carregar .env da raiz do projeto
load_dotenv(ENV_PATH)
