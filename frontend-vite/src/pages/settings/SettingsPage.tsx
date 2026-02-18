import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import './SettingsPage.css'

export default function SettingsPage() {
    const { user, changePassword } = useAuth()
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [notifications, setNotifications] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setEmail(user.email || '')
        }
    }, [user])

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Em um cenário real, chamaria a API aqui
        toast.success('Perfil atualizado com sucesso!')
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem!')
            return
        }

        setIsPasswordLoading(true)
        try {
            await changePassword(currentPassword, newPassword)
            toast.success('Senha alterada com sucesso!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            toast.error(err.message || 'Erro ao alterar senha')
        } finally {
            setIsPasswordLoading(false)
        }
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
                                <div className="password-input-container">
                                    <input
                                        id="current-password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
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
                                <label htmlFor="new-password" className="form-label">Nova senha</label>
                                <div className="password-input-container">
                                    <input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
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
                                <label htmlFor="confirm-password" className="form-label">Confirmar nova senha</label>
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

                            <button type="submit" className="btn btn-primary" disabled={isPasswordLoading}>
                                {isPasswordLoading ? 'Alterando...' : 'Alterar Senha'}
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
