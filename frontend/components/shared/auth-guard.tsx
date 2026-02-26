'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Stethoscope } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || !accessToken)) {
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, accessToken, router]);

  if (!_hasHydrated || !isAuthenticated || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Stethoscope className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
