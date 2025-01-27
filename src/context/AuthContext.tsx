import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

type User = {
    id: string;
    name: string;
    email: string;
    sub: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (credential: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProviderProps = {
    children: ReactNode;
};

const GOOGLE_CLIENT_ID = '1056104670088-ci05aih7o27hp9aj22ppipmh6n7a2174.apps.googleusercontent.com';

export const AuthProvider = ({ children }: ProviderProps) => (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProviderInternal>{children}</AuthProviderInternal>
    </GoogleOAuthProvider>
);

const AuthProviderInternal = ({ children }: ProviderProps) => {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') return null;
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        const savedToken = localStorage.getItem('token');
        return savedToken ? savedToken : null;
    });

    const login = (token: string) => {
        const newUser: User = jwtDecode<User>(token);

        setUser(newUser);
        setToken(token);

        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                setUser(e.newValue ? JSON.parse(e.newValue) : null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
