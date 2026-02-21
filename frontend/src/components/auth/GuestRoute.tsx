import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * GuestRoute: permite acesso apenas para usuários NÃO autenticados.
 * Se já estiver autenticado (cookie válido), redireciona para /launches.
 */
const GuestRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/launches" replace />;
    }

    return <Outlet />;
};

export default GuestRoute;
