module.exports = {
    apps: [
        {
            name: 'encurtador-backend',
            script: 'venv/bin/uvicorn',
            args: 'src.main:app --host 127.0.0.1 --port 8303',
            cwd: './backend',
            interpreter: 'python3',
            env: {
                NODE_ENV: 'production',
            },
            // Reinicia se o app cair
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        },
        {
            name: 'encurtador-redis',
            script: 'redis-server',
            // IMPORTANTE: Se mudou a porta no .env, mude aqui também
            args: '--port 6380',
            autorestart: true,
            watch: false,
        }
    ],
};
