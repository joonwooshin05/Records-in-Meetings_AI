'use client';

import { DependencyProvider } from '@/src/presentation/providers/DependencyProvider';
import { AuthProvider } from '@/src/presentation/providers/AuthProvider';
import { AuthGuard } from '@/src/presentation/components/auth/AuthGuard';
import { I18nProvider } from '@/src/presentation/providers/I18nProvider';
import { Header } from '@/src/presentation/components/layout/Header';
import { SplashScreen } from '@/src/presentation/components/layout/SplashScreen';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SplashScreen>
      <DependencyProvider>
        <AuthProvider>
          <AuthGuard>
            <I18nProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </I18nProvider>
          </AuthGuard>
        </AuthProvider>
      </DependencyProvider>
    </SplashScreen>
  );
}
