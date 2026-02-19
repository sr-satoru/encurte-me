# Redirecionador Web 🚀

Sistema profissional de encurtamento de URLs com analytics, autenticação e arquitetura escalável (inspirado no padrão Superpostiz).

## 🛠️ Tecnologias
- **Backend:** FastAPI (Python), Prisma ORM, Redis.
- **Frontend:** React + Vite, TypeScript.
- **Proxy/Produção:** Nginx.

---

## 📥 Instalação (Ubuntu/Debian)

### 1. Pré-requisitos
Certifique-se de ter Python 3.10+, Node.js 18+ e o Redis instalados.

### 2. Preparando os Serviços
Use os scripts utilitários na pasta `var/`:

```bash
# Instalar o Redis (se não tiver)
bash var/install-redis.sh

# Iniciar o Redis na porta configurada no .env
bash var/start-redis.sh
```

### 3. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
prisma generate
prisma db push
uvicorn src.main:app --reload --port 8303
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Documentação da API

O backend gera automaticamente a documentação interativa da API. Com o backend rodando, acesse:

- **Swagger UI (Interativo):** [http://localhost:8303/docs](http://localhost:8303/docs)
- **ReDoc (Documentação Limpa):** [http://localhost:8303/redoc](http://localhost:8303/redoc)

> [!NOTE]
> No ambiente de desenvolvimento, o Vite faz o proxy de `localhost:5173/api/*` para o backend, permitindo que você use o frontend sem problemas de CORS.

---

## 🚀 Gerenciamento em Produção (PM2)

Para garantir que o sistema continue rodando mesmo após reiniciar o servidor ou erros fatais, recomendamos o uso do **PM2**.

### 1. Iniciar tudo (Backend + Redis)
```bash
pm2 start ecosystem.config.js
```

### 2. Comandos úteis do PM2
- **Ver status:** `pm2 list`
- **Ver logs em tempo real:** `pm2 logs`
- **Reiniciar tudo:** `pm2 restart ecosystem.config.js`
- **Parar tudo:** `pm2 stop ecosystem.config.js`

---

## ⚙️ Configuração de Produção (Nginx)
Para colocar o sistema no ar com seu domínio real:
1. Altere o `FRONTEND_URL` no `.env`.
2. Gere o build do frontend: `cd frontend && npm run build`.
3. Configure o Nginx usando o modelo em `var/nginx.conf`.
4. O Nginx cuidará de remover o prefixo `/api` e entregar as requisições para o FastAPI.
