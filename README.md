<div align="center">

# 🔗 Encurte.me

### Sistema profissional de encurtamento de URLs

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)

*Encurtamento de URLs com analytics, autenticação e arquitetura escalável — inspirado no padrão Superpostiz.*

</div>

---

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | FastAPI (Python), Prisma ORM, Redis |
| **Frontend** | React + Vite, TypeScript |
| **Produção** | Nginx, PM2, Certbot/Let's Encrypt |

---

## 📥 Instalação

Escolha o método de instalação de acordo com o seu ambiente.

### 💻 Desenvolvimento Local

Para rodar o projeto localmente para testes e modificações.

**Pré-requisitos:** Python 3.10+, Node.js 18+ e Redis.

**1. Iniciar serviços**
```bash
bash var/start-redis.sh
```

**2. Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
prisma generate && prisma db push
uvicorn src.main:app --reload --port 8303
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

### 🚀 Deploy em VPS (Produção)

**1. Nginx & SSL**

Configure o Nginx e gere os certificados SSL com Certbot/Let's Encrypt. Use `var/nginx.conf` como referência.

**2. Build do Frontend**
```bash
cd frontend
npm install
npm run build
```

**3. Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
prisma generate && prisma db push
```

**4. Variáveis de Ambiente**

Crie o arquivo `backend/.env` com a variável do banco de dados:
```env
DATABASE_URL="file:./dev.db"
```

**5. Subir com PM2**
```bash
# Na raiz do projeto
pm2 start ecosystem.config.js
```

| Comando | Ação |
|---|---|
| `pm2 list` | Ver status dos processos |
| `pm2 logs` | Logs em tempo real |
| `pm2 restart encurtador-backend` | Reiniciar o backend |

---

## 📖 Documentação da API

Com o servidor rodando, acesse a documentação interativa:

- **Swagger UI:** `http://localhost:5173/docs`
- **ReDoc:** `http://localhost:5173/redoc`

> [!NOTE]
> Em desenvolvimento, o Vite faz proxy de `localhost:5173/api/*` para o backend.
> Em produção, o Nginx é responsável por encaminhar as requisições `/api` ao FastAPI.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
