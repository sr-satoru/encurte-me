import { Outlet } from 'react-router-dom'
import './AuthLayout.css'

export default function AuthLayout() {
    return (
        <div className="auth-layout">
            <div className="auth-background">
                <div className="auth-gradient-orb orb-1"></div>
                <div className="auth-gradient-orb orb-2"></div>
                <div className="auth-gradient-orb orb-3"></div>
            </div>

            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-logo">Redirecionador</h1>
                        <p className="auth-tagline">Gerencie seus links de forma inteligente</p>
                    </div>

                    <Outlet />
                </div>
            </div>
        </div>
    )
}
