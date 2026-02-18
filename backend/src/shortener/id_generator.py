"""
Módulo de Geração de IDs Seguros para URLs Encurtadas.

Segurança em duas camadas:
1. FEISTEL CIPHER: Transforma IDs sequenciais em IDs dispersos usando
   uma rede de Feistel com rounds baseados em HMAC. Produz uma permutação
   bijetiva (sem colisões) com dispersão não-linear — diferenças entre
   IDs consecutivos são completamente imprevisíveis.
2. HASHID: Codifica o ID disperso em hash Base62 com salt secreto.

Propriedades garantidas:
- Determinístico: mesmo input → mesmo output (sem colisões)
- Bijetivo: cada ID mapeia para exatamente um hash único
- Não-linear: diferenças entre outputs consecutivos são imprevisíveis
- Não-adivinhável: sem as chaves secretas, impossível reverter
"""

import os
import hmac
import hashlib
from hashids import Hashids
from dotenv import load_dotenv

load_dotenv()

# Configuração do HashID
HASHID_SALT = os.getenv("HASHID_SALT", "default-insecure-salt-change-me")
HASHID_MIN_LENGTH = int(os.getenv("HASHID_MIN_LENGTH", "4"))

# Chave secreta para a Feistel cipher (independente do salt do HashID)
SCATTER_SECRET = os.getenv("SCATTER_SECRET", "scatter-secret-key-change-me")

# Alfabeto Base62: a-z, A-Z, 0-9
HASHID_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

# Instância global do Hashids
_hashids = Hashids(
    salt=HASHID_SALT,
    min_length=HASHID_MIN_LENGTH,
    alphabet=HASHID_ALPHABET,
)

# --- Feistel Cipher ---
# Uma rede de Feistel é um cifrador de bloco que cria uma permutação
# bijetiva (sem colisões) sobre um espaço de inteiros.
#
# Para um espaço de ~2^30 (~1 bilhão de IDs), dividimos o ID em duas
# metades de 15 bits cada e aplicamos N rounds de Feistel.
#
# Cada round usa HMAC-SHA256 com a chave secreta e o número do round
# para produzir dispersão criptograficamente segura.

FEISTEL_ROUNDS = 8  # Mais rounds = mais seguro (8 é mais que suficiente)
HALF_BITS = 15       # Cada metade tem 15 bits → espaço total = 2^30 = ~1 bilhão
HALF_MASK = (1 << HALF_BITS) - 1  # 0x7FFF = 32767
FULL_SPACE = 1 << (HALF_BITS * 2)  # 2^30 = 1073741824

# Pré-computar chaves de round a partir da secret
_round_keys = []
for i in range(FEISTEL_ROUNDS):
    key = hmac.new(
        SCATTER_SECRET.encode(),
        f"feistel-round-{i}".encode(),
        hashlib.sha256,
    ).digest()
    _round_keys.append(key)


def _feistel_round_fn(half: int, round_idx: int) -> int:
    """
    Função de round Feistel: produz um valor pseudo-aleatório
    baseado no input e no número do round.
    
    Usa HMAC-SHA256 para dispersão criptográfica.
    """
    data = half.to_bytes(4, 'big')
    h = hmac.new(_round_keys[round_idx], data, hashlib.sha256).digest()
    return int.from_bytes(h[:4], 'big') & HALF_MASK


def _scatter(sequential_id: int) -> int:
    """
    Dispersa um ID sequencial usando uma Feistel cipher.
    
    Propriedades:
    - Bijetivo: cada input gera um output único (permutação)
    - Determinístico: mesmo input sempre gera mesmo output
    - Não-linear: inputs consecutivos geram outputs sem padrão
    - Reversível: via _unscatter() com as mesmas chaves
    """
    # Mapear para espaço [0, FULL_SPACE)
    val = sequential_id % FULL_SPACE
    
    # Dividir em duas metades
    left = (val >> HALF_BITS) & HALF_MASK
    right = val & HALF_MASK
    
    # Aplicar rounds de Feistel
    for i in range(FEISTEL_ROUNDS):
        new_right = left ^ _feistel_round_fn(right, i)
        left = right
        right = new_right
    
    # Recombinar
    return (left << HALF_BITS) | right


def _unscatter(scattered_id: int) -> int:
    """Reverte a Feistel cipher — recupera o ID sequencial original."""
    left = (scattered_id >> HALF_BITS) & HALF_MASK
    right = scattered_id & HALF_MASK
    
    # Aplicar rounds reversos
    for i in range(FEISTEL_ROUNDS - 1, -1, -1):
        new_left = right ^ _feistel_round_fn(left, i)
        right = left
        left = new_left
    
    return (left << HALF_BITS) | right


# --- API Pública ---

def encode_id(numeric_id: int) -> str:
    """
    Codifica um ID numérico em um hash Base62 seguro.
    
    Fluxo: ID sequencial → Feistel scatter → HashID encode
    
    Duas camadas de proteção:
    1. Feistel: dispersão não-linear (sem padrão nos outputs)
    2. HashID: codificação Base62 com salt secreto
    
    Mesmo que um atacante quebre o HashID, ele vê IDs dispersos
    sem nenhuma relação entre eles.
    """
    scattered = _scatter(numeric_id)
    return _hashids.encode(scattered)


def decode_id(hash_str: str) -> int | None:
    """
    Decodifica um hash Base62 de volta para o ID numérico original.
    
    Fluxo: Hash → HashID decode → Feistel unscatter → ID sequencial
    
    Uso interno apenas — para operações administrativas ou debug.
    """
    result = _hashids.decode(hash_str)
    if not result:
        return None
    scattered = result[0]
    return _unscatter(scattered)
