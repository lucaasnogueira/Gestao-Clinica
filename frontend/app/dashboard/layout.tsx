'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { AuthGuard } from '@/components/shared/auth-guard';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}>
          <Navbar />
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 md:p-6 max-w-[1440px] mx-auto min-h-full pb-20">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
