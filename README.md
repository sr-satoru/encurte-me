# Redirecionador Web 🚀

Sistema profissional de encurtamento de URLs com analytics, autenticação e arquitetura escalável (inspirado no padrão Superpostiz).

## 🛠️ Tecnologias
- **Backend:** FastAPI (Python), Prisma ORM, Redis.
- **Frontend:** React + Vite, TypeScript.
- **Proxy/Produção:** Nginx.

---

## 📥 Instalação

Escolha o método de instalação de acordo com o seu ambiente.

---

### 💻 Desenvolvimento Local

Para rodar o projeto localmente para testes e modificações:

#### 1. Pré-requisitos
Instale o Python 3.10+, Node.js 18+ e o Redis.

#### 2. Preparando os Serviços
```bash
# Iniciar o Redis (configurado no .env)
bash var/start-redis.sh
```

#### 3. Backend (Desenvolvimento)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
prisma generate
prisma db push
uvicorn src.main:app --reload --port 8303
```

#### 4. Frontend (Desenvolvimento)
```bash
cd frontend
npm install
npm run dev
```

---

### 🚀 Deploy em VPS (Produção)

Este é o método recomendado para colocar o sistema no ar de forma estável.

#### 1. Proxy e SSL (Nginx)
Configure o Nginx no seu servidor e gere os certificados SSL (Certbot/Let's Encrypt). Use o modelo fornecido em `var/nginx.conf` como referência.

#### 2. Build do Frontend
```bash
cd frontend
npm install
npm run build
```

#### 3. Configuração do Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
prisma generate
prisma db push
```

#### 4. Variáveis de Ambiente (.env)
No arquivo `.env` na raiz do projeto, certifique-se de configurar o caminho **absoluto** do banco de dados SQLite, pois em modo de produção ele pode não localizar o arquivo a partir da raiz:

```env
DATABASE_URL="file:/caminho/completo/para/o/projeto/backend/prisma/dev.db"
```

#### 5. Gerenciamento com PM2
O PM2 manterá os processos ativos e reiniciará o sistema em caso de falhas ou reboot do servidor.

```bash
# Na raiz do projeto
pm2 start ecosystem.config.js
```

**Comandos úteis do PM2:**
- `pm2 list` (Ver status)
- `pm2 logs` (Ver logs em tempo real)
- `pm2 restart encurtador-backend` (Reiniciar backend)

---

## 📖 Documentação da API

O backend gera automaticamente a documentação interativa da API. Com o backend rodando, acesse:

- **Swagger UI:** `http://seu-dominio.com/docs`
- **ReDoc:** `http://seu-dominio.com/redoc`

> [!NOTE]
> No ambiente de desenvolvimento, o Vite faz o proxy de `localhost:5173/api/*` para o backend. Em produção, o Nginx é responsável por encaminhar as requisições `/api` para o serviço FastAPI.
