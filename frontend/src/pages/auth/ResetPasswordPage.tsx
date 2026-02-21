import { useState, FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { apiFetch } from '../../api/auth'

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token') || ''

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [success, setSuccess] = useState(false)

    if (!token) {
        return (
            <div className="auth-form-container">
                <h2 className="auth-form-title">Link inválido</h2>
                <p className="auth-form-subtitle">
                    Este link de recuperação é inválido ou já expirou.
                </p>
                <div className="auth-alternative" style={{ marginTop: '1.5rem' }}>
                    <Link to="/auth/forgot-password" className="link-text link-primary">
                        Solicitar novo link →
                    </Link>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem!')
            return
        }

        setIsLoading(true)

        try {
            await apiFetch('/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, new_password: password }),
            })
            setSuccess(true)
        } catch (err: any) {
            toast.error(err.message || 'Erro ao redefinir senha')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-form-container">
                <div className="success-icon-container">
                    <svg className="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="40" height="40">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="auth-form-title">Senha redefinida!</h2>
                <p className="auth-form-subtitle">
                    Sua senha foi alterada com sucesso. Faça login com sua nova senha.
                </p>
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '1.5rem', width: '100%' }}
                    onClick={() => navigate('/auth/login', { replace: true })}
                >
                    Ir para o Login
                </button>
            </div>
        )
    }

    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Nova senha</h2>
            <p className="auth-form-subtitle">
                Crie uma nova senha para sua conta
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="password" className="form-label">
                        Nova senha
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
                            minLength={6}
                            autoFocus
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

                <div className="form-group">
                    <label htmlFor="confirm-password" className="form-label">
                        Confirmar nova senha
                    </label>
                    <div className="password-input-container">
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
                        >
                            {showConfirmPassword ? (
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

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="btn-loading">
                            <span className="spinner"></span>
                            Redefinindo...
                        </span>
                    ) : (
                        'Redefinir Senha'
                    )}
                </button>
            </form>
        </div>
    )
}
