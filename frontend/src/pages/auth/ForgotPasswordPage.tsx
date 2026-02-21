import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { apiFetch } from '../../api/auth'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await apiFetch('/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            })
            setSent(true)
        } catch (err: any) {
            toast.error(err.message || 'Erro ao enviar email')
        } finally {
            setIsLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="auth-form-container">
                <div className="success-icon-container">
                    <svg className="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="40" height="40">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="auth-form-title">Email enviado!</h2>
                <p className="auth-form-subtitle">
                    Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha. Verifique também a pasta de spam.
                </p>
                <p className="auth-form-subtitle" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    O link expira em 10 minutos.
                </p>
                <div className="auth-alternative" style={{ marginTop: '1.5rem' }}>
                    <Link to="/auth/login" className="link-text link-primary">
                        ← Voltar ao login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Esqueceu a senha?</h2>
            <p className="auth-form-subtitle">
                Digite seu email e enviaremos um link para redefinir sua senha
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email" className="form-label">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        placeholder="seu@email.com"
                        required
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="btn-loading">
                            <span className="spinner"></span>
                            Enviando...
                        </span>
                    ) : (
                        'Enviar link de recuperação'
                    )}
                </button>
            </form>

            <div className="auth-divider">
                <span>ou</span>
            </div>

            <div className="auth-alternative">
                <p className="text-secondary">
                    Lembrou a senha?{' '}
                    <Link to="/auth/login" className="link-text link-primary">
                        Fazer login
                    </Link>
                </p>
            </div>
        </div>
    )
}
