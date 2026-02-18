"""
Módulo unificador de Captcha.

Detecta automaticamente qual provider usar baseado nas variáveis de ambiente:
- Se TURNSTILE_SECRET_KEY → usa Cloudflare Turnstile
- Se RECAPTCHA_SECRET_KEY → usa Google reCAPTCHA
- Se nenhuma → dev mode (libera sem verificação)

Prioridade: Turnstile > reCAPTCHA (Turnstile é gratuito e privacy-first)

Uso:
    from src.auth.captcha import verify_captcha, CAPTCHA_PROVIDER
    await verify_captcha(token)
"""

import os
import src.config  # noqa: F401 — carrega .env da raiz


# Detectar provider baseado nas env vars
_TURNSTILE_KEY = os.getenv("TURNSTILE_SECRET_KEY")
_RECAPTCHA_KEY = os.getenv("RECAPTCHA_SECRET_KEY")

if _TURNSTILE_KEY:
    CAPTCHA_PROVIDER = "turnstile"
elif _RECAPTCHA_KEY:
    CAPTCHA_PROVIDER = "recaptcha"
else:
    CAPTCHA_PROVIDER = "none"  # Dev mode


async def verify_captcha(token: str | None) -> bool:
    """
    Verifica o token de captcha usando o provider configurado.
    
    - Se nenhum provider configurado → libera (dev mode)
    - Se Turnstile → verifica via Cloudflare
    - Se reCAPTCHA → verifica via Google
    """
    if CAPTCHA_PROVIDER == "none":
        return True
    
    if CAPTCHA_PROVIDER == "turnstile":
        from src.auth.cloudflare import verify_turnstile
        return await verify_turnstile(token)
    
    if CAPTCHA_PROVIDER == "recaptcha":
        from src.auth.recaptcha import verify_recaptcha
        return await verify_recaptcha(token)
    
    return True
