import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './AuthForms.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        console.log('Login:', { email, password })
        setIsLoading(false)
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
