'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Search, Sun, Moon, LogOut, 
  Menu, User, Settings, ChevronDown 
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/lib/services';
import { cn, getInitials, ROLE_LABELS } from '@/lib/utils';
import { toast } from 'sonner';

export function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    router.push('/login');
    toast.success('Logout realizado com sucesso');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            title="Alternar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center relative max-w-md w-full">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar paciente ou consulta..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-transparent rounded-xl text-sm focus:bg-background focus:border-ring/50 focus:ring-4 focus:ring-ring/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 md:gap-3">
          
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="w-px h-6 bg-border mx-1 hidden md:block" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={cn(
                "flex items-center gap-2 p-1 md:pr-3 rounded-xl hover:bg-accent transition-all select-none",
                profileOpen && "bg-accent"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {user?.email ? getInitials(user.email.split('@')[0].replace(/[._-]/g, ' ')) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-foreground leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-1">
                  {user?.role ? ROLE_LABELS[user.role] : ''}
                </p>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", profileOpen && "rotate-180")} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-10 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-border md:hidden">
                    <p className="text-sm font-bold text-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user?.role ? ROLE_LABELS[user.role] : ''}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setProfileOpen(false); router.push('/dashboard/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </button>
                  
                  <button 
                    onClick={() => { setProfileOpen(false); router.push('/dashboard/profile'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </button>

                  <div className="h-px bg-border my-1.5" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair do Sistema
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
