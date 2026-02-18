import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './AuthForms.css'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const from = location.state?.from?.pathname || '/launches'

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await login(email, password)
            navigate(from, { replace: true })
        } catch (err: any) {
            setError(err.message || 'Falha ao entrar. Verifique suas credenciais.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Bem-vindo de volta</h2>
            <p className="auth-form-subtitle">Entre com suas credenciais para continuar</p>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

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
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">
                        Senha
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="form-footer">
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox" />
                        <span>Lembrar-me</span>
                    </label>
                    <a href="#" className="link-text">Esqueceu a senha?</a>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="btn-loading">
                            <span className="spinner"></span>
                            Entrando...
                        </span>
                    ) : (
                        'Entrar'
                    )}
                </button>
            </form>

            <div className="auth-divider">
                <span>ou</span>
            </div>

            <div className="auth-alternative">
                <p className="text-secondary">
                    Não tem uma conta?{' '}
                    <Link to="/auth/register" className="link-text link-primary">
                        Criar conta
                    </Link>
                </p>
            </div>
        </div>
    )
}
