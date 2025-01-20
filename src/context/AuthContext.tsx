import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

type User = {
    id: string;
    name: string;
    email: string;
    sub: string;
};

type AuthContextType = {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <GoogleOAuthProvider clientId="1056104670088-ci05aih7o27hp9aj22ppipmh6n7a2174.apps.googleusercontent.com">
        <AuthProviderInternal>{children}</AuthProviderInternal>
    </GoogleOAuthProvider>
);

const AuthProviderInternal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (user: User) => {
        setUser(user);
    };

    const logout = () => {
        setUser(null);
        // Perform any additional logout operations
    };

    useEffect(() => {
        // Check if user is already logged in and set the user state
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
