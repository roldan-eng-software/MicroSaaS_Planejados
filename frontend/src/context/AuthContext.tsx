// frontend/src/context/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth'; // Criaremos este tipo
import api from '@/services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded: { sub: string, tenant_id: string } = jwtDecode(token);
        // Aqui você poderia buscar os detalhes do usuário da API
        setUser({ id: decoded.sub, tenant_id: decoded.tenant_id });
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('auth_token', token);
    const decoded: { sub: string, tenant_id: string } = jwtDecode(token);
    setUser({ id: decoded.sub, tenant_id: decoded.tenant_id });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
