import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AuthLayout from './pages/auth/AuthLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import HomePage from './pages/home/HomePage'
import GraphsPage from './pages/graphs/GraphsPage'
import SettingsPage from './pages/settings'
import RedirectPage from './pages/redirect/RedirectPage'

import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import GuestRoute from './components/auth/GuestRoute'

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" expand={false} richColors />
            <Routes>
                <Route path="/" element={<Navigate to="/launches" replace />} />

                {/* Rotas Protegidas */}
                <Route path="/launches" element={
                    <PrivateRoute>
                        <HomePage />
                    </PrivateRoute>
                } />
                <Route path="/graphs" element={
                    <PrivateRoute>
                        <GraphsPage />
                    </PrivateRoute>
                } />
                <Route path="/settings" element={
                    <PrivateRoute>
                        <SettingsPage />
                    </PrivateRoute>
                } />

                {/* Rotas de Auth */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route index element={<Navigate to="/auth/login" replace />} />

                    {/* Rotas bloqueadas para usuários já autenticados */}
                    <Route element={<GuestRoute />}>
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                    </Route>

                    {/* Rotas sempre públicas */}
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Redirecionamento de URLs curtas (público, antes do catch-all) */}
                <Route path="/:shortCode" element={<RedirectPage />} />

                <Route path="*" element={<Navigate to="/launches" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App

