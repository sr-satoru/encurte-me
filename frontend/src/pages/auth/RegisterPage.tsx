import { useState, FormEvent, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import { useCaptcha } from '../../hooks/useRecaptcha'
import { apiFetch } from '../../api/auth'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [canRegister, setCanRegister] = useState<boolean | null>(null)
    const { renderWidget, execute: executeCaptcha } = useCaptcha()

    useEffect(() => {
        apiFetch('/auth/can-register')
            .then((data: { register: boolean }) => setCanRegister(data.register))
            .catch(() => setCanRegister(true)) // em caso de erro, permite (fail-open)
    }, [])

    const captchaRef = useCallback((node: HTMLDivElement | null) => {
        if (node) renderWidget(node)
    }, [renderWidget])

    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem!')
            return
        }

        setIsLoading(true)

        try {
            const captchaToken = await executeCaptcha()
            await register(email, password, name, captchaToken || undefined)
            toast.success('Conta criada com sucesso!')
            setTimeout(() => {
                navigate('/launches')
            }, 1000)
        } catch (err: any) {
            toast.error(err.message || 'Falha ao criar conta. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    // Enquanto verifica se o registro está habilitado
    if (canRegister === null) {
        return (
            <div className="auth-form-container">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <span className="spinner" style={{ width: 32, height: 32 }}></span>
                </div>
            </div>
        )
    }

    // Registro desabilitado pelo administrador
    if (canRegister === false) {
        return (
            <div className="auth-form-container">
                <h2 className="auth-form-title">Registro desabilitado</h2>
                <p className="auth-form-subtitle">
                    O cadastro de novos usuários está desabilitado no momento.
                </p>
                <div className="auth-alternative" style={{ marginTop: '1.5rem' }}>
                    <p className="text-secondary">
                        Já tem uma conta?{' '}
                        <Link to="/auth/login" className="link-text link-primary">
                            Fazer login
                        </Link>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-form-container">
            <h2 className="auth-form-title">Crie sua conta</h2>
            <p className="auth-form-subtitle">Cadastre-se para começar a encurtar links</p>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="name" className="form-label">
                        Nome completo
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                        placeholder="Seu nome"
                        required
                    />
                </div>

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
                            minLength={6}
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
                    <label htmlFor="confirmPassword" className="form-label">
                        Confirmar senha
                    </label>
                    <div className="password-input-container">
                        <input
                            id="confirmPassword"
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

                {/* reCAPTCHA invisible container */}
                <div ref={captchaRef}></div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="btn-loading">
                            <span className="spinner"></span>
                            Criando conta...
                        </span>
                    ) : (
                        'Criar conta'
                    )}
                </button>
            </form>

            <div className="auth-divider">
                <span>ou</span>
            </div>

            <div className="auth-alternative">
                <p className="text-secondary">
                    Já tem uma conta?{' '}
                    <Link to="/auth/login" className="link-text link-primary">
                        Fazer login
                    </Link>
                </p>
            </div>
        </div>
    )
}

