import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './pages/auth/AuthLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/launches" replace />} />
            <Route path="/launches" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<Navigate to="/auth/login" replace />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/launches" replace />} />
        </Routes>
    )
}

export default App
