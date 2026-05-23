import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import api from '../lib/api';
import type { AuthResponse, User, UserRole } from '../types';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('technovan_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.get<User>('/auth/profile')
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('technovan_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const setSession = (payload: AuthResponse) => {
    localStorage.setItem('technovan_token', payload.token);
    setToken(payload.token);
    setUser(payload.user);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    async login(email: string, password: string) {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      setSession(response.data);
    },
    async register(input: RegisterInput) {
      const response = await api.post<AuthResponse>('/auth/register', input);
      setSession(response.data);
    },
    logout() {
      localStorage.removeItem('technovan_token');
      setToken(null);
      setUser(null);
    },
    loading,
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}