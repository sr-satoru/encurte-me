import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './AuthForms.css'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('As senhas não coincidem!')
            return
        }

        setIsLoading(true)

        try {
            await register(email, password, name)
            setSuccess(true)
            setTimeout(() => {
                navigate('/launches')
            }, 1000)
        } catch (err: any) {
            setError(err.message || 'Falha ao criar conta. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-form-container">


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
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                        Confirmar senha
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                        placeholder="••••••••"
                        required
                        minLength={6}
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
