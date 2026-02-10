'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/src/domain/entities/User';
import { useDependencies } from './DependencyProvider';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { authService } = useDependencies();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, [authService]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      await authService.signUp(email, password);
    },
    [authService]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      await authService.signIn(email, password);
    },
    [authService]
  );

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, [authService]);

  const signOut = useCallback(async () => {
    await authService.signOut();
  }, [authService]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
