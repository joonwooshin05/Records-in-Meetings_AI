'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { AppDependencies } from '@/src/di/container';
import { createDependencies } from '@/src/di/container';

const DependencyContext = createContext<AppDependencies | null>(null);

export function DependencyProvider({ children }: { children: React.ReactNode }) {
  const deps = useMemo(() => createDependencies(), []);

  return (
    <DependencyContext.Provider value={deps}>
      {children}
    </DependencyContext.Provider>
  );
}

export function useDependencies(): AppDependencies {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
}
