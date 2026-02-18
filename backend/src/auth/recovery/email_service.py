"""
Serviço de envio de email para recuperação de senha.

Usa aiosmtplib para envio assíncrono via SMTP.
Configuração via .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
"""

import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import src.config  # noqa: F401

SMTP_HOST = os.getenv("SMTP_HOST")
_port = os.getenv("SMTP_PORT")
SMTP_PORT = int(_port) if _port else None
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM")
FRONTEND_URL = os.getenv("FRONTEND_URL")


async def send_recovery_email(to_email: str, token: str) -> bool:
    """
    Envia email de recuperação de senha com link contendo o token.
    
    Returns:
        True se enviado com sucesso, False se erro
    """
    reset_link = f"{FRONTEND_URL}/auth/reset-password?token={token}"
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Recuperação de Senha"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    
    # Conteúdo texto simples
    text_content = f"""Olá,

Recebemos uma solicitação para redefinir sua senha.

Clique no link abaixo para criar uma nova senha:
{reset_link}

Este link expira em 10 minutos.

Se você não solicitou a redefinição de senha, ignore este email.
"""
    
    # Conteúdo HTML
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #262626;border-radius:16px;padding:40px;">
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <div style="width:56px;height:56px;background:rgba(79,70,229,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                                <span style="font-size:24px;">🔒</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom:12px;">
                            <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">Recuperação de Senha</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom:32px;">
                            <p style="color:#888888;font-size:14px;line-height:1.6;margin:0;">
                                Recebemos uma solicitação para redefinir a senha da sua conta.
                                Clique no botão abaixo para criar uma nova senha.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom:32px;">
                            <a href="{reset_link}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
                                Redefinir Senha
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <p style="color:#666666;font-size:12px;margin:0;">
                                ⏱️ Este link expira em <strong style="color:#888;">10 minutos</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top:1px solid #262626;padding-top:20px;">
                            <p style="color:#555555;font-size:11px;line-height:1.5;margin:0;text-align:center;">
                                Se você não solicitou a redefinição de senha, ignore este email.<br>
                                Sua senha permanecerá inalterada.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))
    
    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASS,
            start_tls=True,
        )
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Falha ao enviar email para {to_email}: {e}")
        return False
