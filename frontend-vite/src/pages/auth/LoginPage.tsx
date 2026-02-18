import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import './AuthForms.css'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const from = location.state?.from?.pathname || '/launches'

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await login(email, password)
            toast.success('Bem-vindo!')
            navigate(from, { replace: true })
        } catch (err: any) {
            toast.error(err.message || 'Falha ao entrar. Verifique suas credenciais.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Bem-vindo de volta</h2>
            <p className="auth-form-subtitle">Entre com suas credenciais para continuar</p>

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
                    <div className="password-input-container">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                        >
                            {showPassword ? (
                                <svg className="password-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.878 15.526L19.732 21.38M9.622 10.551L14.281 15.21M15.047 12.148L17.509 14.61M12 5C5 5 2 12 2 12C2.369 12.738 3.111 14.162 4.356 15.527M7.051 17.568C8.514 18.513 10.218 19 12 19C19 19 22 12 22 12C21.603 11.207 20.81 9.704 19.509 8.318M10.733 5.076C11.15 5.026 11.571 5 12 5M15.237 5.688C15.865 5.922 16.467 6.223 17.03 6.587M11.35 11.35L12.65 12.65M12.65 11.35L11.35 12.65" />
                                </svg>
                            ) : (
                                <svg className="password-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
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
