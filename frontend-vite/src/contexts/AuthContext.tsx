import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../api/auth';

interface User {
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const userData = await apiFetch('/me');
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setUser(data.user);
    };

    const register = async (email: string, password: string, name?: string) => {
        const data = await apiFetch('/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        setUser(data.user);
    };

    const logout = async () => {
        await apiFetch('/logout', { method: 'POST' });
        setUser(null);
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        await apiFetch('/change-password', {
            method: 'POST',
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                changePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
