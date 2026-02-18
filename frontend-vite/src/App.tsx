import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './pages/auth/AuthLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/home/HomePage'
import GraphsPage from './pages/graphs/GraphsPage'
import SettingsPage from './pages/settings'

import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'

function App() {
    return (
        <AuthProvider>
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

                {/* Rotas Públicas */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route index element={<Navigate to="/auth/login" replace />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/launches" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
