import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const STORAGE_KEY = 'molip-auth-logged-in';

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredLogin = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => readStoredLogin());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isLoggedIn));
  }, [isLoggedIn]);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

  const value = useMemo(() => ({ isLoggedIn, login, logout }), [isLoggedIn, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
