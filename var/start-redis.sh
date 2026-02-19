#!/bin/bash

# Script para iniciar o Redis usando a porta definida no .env

# Caminho para o arquivo .env (tenta local e tenta na pasta pai)
if [ -f ".env" ]; then
    ENV_FILE=".env"
elif [ -f "../.env" ]; then
    ENV_FILE="../.env"
else
    echo "Erro: Arquivo .env não encontrado!"
    exit 1
fi

# Extrai a REDIS_URL do arquivo .env
REDIS_URL_LINE=$(grep "^REDIS_URL=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$REDIS_URL_LINE" ]; then
    echo "Erro: REDIS_URL não definida no .env"
    exit 1
fi

# Extrai a porta da URL (ex: redis://localhost:6379/0 -> 6379)
# Usa sed para pegar os números entre o último ':' e a próxima '/' ou fim da string
REDIS_PORT=$(echo "$REDIS_URL_LINE" | sed -n 's/.*:\([0-9]\{1,5\}\).*/\1/p')

if [ -z "$REDIS_PORT" ]; then
    echo "Erro: Não foi possível extrair a porta da REDIS_URL: $REDIS_URL_LINE"
    exit 1
fi

echo "🚀 Iniciando Redis na porta: $REDIS_PORT"
echo "URL detectada: $REDIS_URL_LINE"

# Inicia o redis-server
redis-server --port "$REDIS_PORT"
