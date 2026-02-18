from fastapi import FastAPI

# Metadados estendidos do Swagger
description = """
🚀 **URL Shortener API** - Sistema premium de encurtamento de URLs com métricas em tempo real.

## Features
*   **Encurtamento**: Gere links curtos e seguros.
*   **Analytics**: Acompanhe cliques, localização e hora (via Redis).
*   **Segurança**: Proteção com Captcha e autenticação JWT.
*   **Recuperação**: Sistema de troca de senha via e-mail.
"""

# Categorização de endpoints
tags_metadata = [
    {
        "name": "Auth",
        "description": "Operações de autenticação (Login, Registro, Logout).",
    },
    {
        "name": "Account",
        "description": "Gestão da conta do usuário.",
    },
    {
        "name": "urls",
        "description": "CRUD de links encurtados e métricas.",
    },
    {
        "name": "recovery",
        "description": "Fluxo de recuperação de senha.",
    },
    {
        "name": "System",
        "description": "Endpoints de utilidade e monitoramento.",
    },
]

def setup_swagger(app: FastAPI):
    """
    Configura a documentação Swagger na instância do FastAPI.
    Mantém o título original se já foi definido, ou aplica o novo.
    """
    app.description = description
    app.version = "1.0.0"
    app.openapi_tags = tags_metadata
    
    # Customização adicional se necessário
    if app.title == "FastAPI": # Default do FastAPI
        app.title = "Redirecionador Web API"
