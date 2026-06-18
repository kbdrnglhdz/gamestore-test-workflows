import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setTokens, clearTokens, getToken, startProactiveRefresh, stopProactiveRefresh, setSessionCallbacks, clearSessionCallbacks, extendSession } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionExpiring: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  extendSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiring, setSessionExpiring] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.auth.me()
        .then(data => {
          if (!data.error) {
            setUser(data);
            startProactiveRefresh();
          } else {
            clearTokens();
          }
        })
        .catch(() => clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSessionCallbacks({
      onExpiryWarning: () => setSessionExpiring(true),
      onSessionExpired: () => {
        clearTokens();
        setUser(null);
        setSessionExpiring(false);
        window.location.href = '/login';
      }
    });

    return () => {
      clearSessionCallbacks();
    };
  }, []);

  const handleExtendSession = async (): Promise<boolean> => {
    const success = await extendSession();
    if (success) {
      setSessionExpiring(false);
    }
    return success;
  };

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    if (data.error) throw new Error(data.error);
    setTokens(data.token, data.refreshToken);
    setUser(data.user);
    startProactiveRefresh();
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await api.auth.register({ email, password, name });
    if (data.error) throw new Error(data.error);
    setTokens(data.token, data.refreshToken);
    setUser(data.user);
    startProactiveRefresh();
  };

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // API failure — still proceed with local cleanup
    }
    clearTokens();
    setUser(null);
    setSessionExpiring(false);
    stopProactiveRefresh();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, sessionExpiring, login, register, logout, extendSession: handleExtendSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
