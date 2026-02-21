import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className="auth-layout">
            {/* Left Side - Form */}
            <div className="auth-left">
                <div className="auth-header">
                    <h1 className="auth-logo">
                        <svg className="logo-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Redirecionador
                    </h1>
                    <p className="auth-tagline">Gerencie seus links de forma inteligente</p>
                </div>

                <div className="auth-content">
                    <div className="auth-container">
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* Right Side - Hero */}
            <div className="auth-right">
                <div className="auth-hero">
                    <h2 className="hero-title">
                        Simplifique seus <span className="hero-highlight">links</span> e amplifique seu <span className="hero-highlight">alcance</span>
                    </h2>
                    <p className="hero-subtitle">
                        Crie, gerencie e monitore links encurtados de forma profissional
                    </p>
                </div>
            </div>
        </div>
    )
}
