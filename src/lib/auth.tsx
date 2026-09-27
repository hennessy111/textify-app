// Контекст авторизации

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Profile } from '../types';
import * as api from './mockApi';

interface AuthContextType {
  user: User | null;
  profile: Profile;
  remaining: number;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({ id: '', is_premium: false, created_at: '' });
  const [remaining, setRemaining] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me.user);
      setProfile({ id: me.user?.id || '', is_premium: me.profile.is_premium, created_at: '' });
      setRemaining(me.remaining);
    } catch {
      // Игнорируем ошибки при обновлении
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await refresh();
      setIsLoading(false);
    };
    init();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    setUser(result.user);
    setProfile(result.profile);
    await refresh();
  };

  const register = async (email: string, password: string) => {
    const result = await api.register(email, password);
    setUser(result.user);
    setProfile(result.profile);
    await refresh();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setProfile({ id: '', is_premium: false, created_at: '' });
    setRemaining(3);
  };

  return (
    <AuthContext.Provider value={{ user, profile, remaining, isLoading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
