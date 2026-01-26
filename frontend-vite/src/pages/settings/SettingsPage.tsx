import { useState } from 'react'
import './SettingsPage.css'

export default function SettingsPage() {
    const [name, setName] = useState('Usuário')
    const [email, setEmail] = useState('user@email.com')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [notifications, setNotifications] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(false)

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Profile updated:', { name, email })
        alert('Perfil atualizado com sucesso!')
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!')
            return
        }
        console.log('Password changed')
        alert('Senha alterada com sucesso!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1 className="settings-title">Configurações</h1>
                <p className="settings-subtitle">Gerencie suas preferências e informações da conta</p>
            </div>

            <div className="settings-grid">
                {/* Profile Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Perfil
                        </h2>
                        <p className="card-description">Atualize suas informações pessoais</p>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleProfileSubmit} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Nome completo</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-input"
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>

                {/* Security Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Segurança
                        </h2>
                        <p className="card-description">Altere sua senha de acesso</p>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handlePasswordSubmit} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="current-password" className="form-label">Senha atual</label>
                                <input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="new-password" className="form-label">Nova senha</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm-password" className="form-label">Confirmar nova senha</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Alterar Senha
                            </button>
                        </form>
                    </div>
                </div>

                {/* Notifications Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notificações
                        </h2>
                        <p className="card-description">Configure como você deseja ser notificado</p>
                    </div>

                    <div className="card-body">
                        <div className="settings-form">
                            <div className="toggle-group">
                                <div className="toggle-info">
                                    <div className="toggle-label">Notificações push</div>
                                    <div className="toggle-description">Receba notificações no navegador</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications}
                                        onChange={(e) => setNotifications(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-group">
                                <div className="toggle-info">
                                    <div className="toggle-label">Notificações por email</div>
                                    <div className="toggle-description">Receba atualizações por email</div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone Card */}
                <div className="settings-card danger-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <svg className="card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Zona de Perigo
                        </h2>
                        <p className="card-description">Ações irreversíveis</p>
                    </div>

                    <div className="card-body">
                        <div className="danger-actions">
                            <button className="btn btn-danger">
                                Deletar Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
