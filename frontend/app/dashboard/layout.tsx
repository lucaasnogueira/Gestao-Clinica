'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { AuthGuard } from '@/components/shared/auth-guard';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className={cn(
          "flex-1 overflow-y-auto scrollbar-thin transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}>
          <div className="p-6 max-w-[1440px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
