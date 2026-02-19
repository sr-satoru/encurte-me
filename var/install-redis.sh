#!/bin/bash

# Script para instalar o Redis no Ubuntu/Debian

echo "🔍 Verificando se o Redis já está instalado..."

if command -v redis-server >/dev/null 2>&1; then
    echo "✅ Redis já está instalado!"
    redis-server --version
else
    echo "⚠️ Redis não encontrado. Iniciando instalação..."
    
    # Verifica se tem permissão de sudo
    if [ "$EUID" -ne 0 ]; then
        echo "Aguardando permissão de superusuário (sudo)..."
        SUDO="sudo"
    else
        SUDO=""
    fi

    echo "🔄 Atualizando listas de pacotes..."
    $SUDO apt update

    echo "📦 Instalando redis-server..."
    $SUDO apt install -y redis-server

    if [ $? -eq 0 ]; then
        echo "✅ Redis instalado com sucesso!"
        
        echo "⚙️ Configurando para não iniciar automaticamente como serviço do sistema (opcional)..."
        # Isso evita conflitos se você quiser rodar apenas via script na porta do .env
        $SUDO systemctl stop redis-server
        $SUDO systemctl disable redis-server
        
        echo "🎉 Tudo pronto! Agora você pode usar o './var/start-redis.sh' para rodar o Redis."
    else
        echo "❌ Erro ao instalar o Redis. Verifique sua conexão ou repositórios."
        exit 1
    fi
fi
