import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const location = useLocation()

    const menuItems = [
        { path: '/', icon: '🏠', label: 'Home' },
        { path: '/settings', icon: '⚙️', label: 'Configurações' },
    ]

    const isActive = (path: string) => location.pathname === path

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
            >
                <span className="hamburger-icon">
                    {isMobileOpen ? '✕' : '☰'}
                </span>
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h1 className="sidebar-logo">Redirecionador</h1>
                    <p className="sidebar-tagline">Gerencie seus links</p>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">👤</div>
                        <div className="user-info">
                            <div className="user-name">Usuário</div>
                            <div className="user-email">user@email.com</div>
                        </div>
                    </div>
                    <button className="btn-logout">
                        <span className="logout-icon">🚪</span>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
