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

            <div className="settings-container">
                {/* Profile Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">👤</span>
                            Perfil
                        </h2>
                        <p className="section-description">Atualize suas informações pessoais</p>
                    </div>

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
                </section>

                {/* Password Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">🔒</span>
                            Segurança
                        </h2>
                        <p className="section-description">Altere sua senha de acesso</p>
                    </div>

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
                </section>

                {/* Notification Settings */}
                <section className="settings-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">🔔</span>
                            Notificações
                        </h2>
                        <p className="section-description">Configure como você deseja ser notificado</p>
                    </div>

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
                </section>

                {/* Danger Zone */}
                <section className="settings-section danger-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="section-icon">⚠️</span>
                            Zona de Perigo
                        </h2>
                        <p className="section-description">Ações irreversíveis</p>
                    </div>

                    <div className="danger-actions">
                        <button className="btn btn-danger">
                            Deletar Conta
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}
