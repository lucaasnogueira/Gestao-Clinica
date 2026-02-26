'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, CalendarDays, UserRound,
  FileText, Receipt, Shield, BarChart3, Settings,
  Stethoscope, LogOut, ChevronRight, Bell,
  PanelLeftClose, PanelLeftOpen, Sun, Moon
} from 'lucide-react';
import { cn, ROLE_LABELS, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/lib/services';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import type { Role } from '@/types';
import { useEffect, useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',                    label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/dashboard/patients',           label: 'Pacientes',     icon: Users },
  { href: '/dashboard/appointments',       label: 'Agendamentos',  icon: CalendarDays },
  { href: '/dashboard/doctors',            label: 'Médicos',       icon: UserRound },
  { href: '/dashboard/medical-records',    label: 'Prontuários',   icon: FileText },
  { href: '/dashboard/billing',            label: 'Faturamento',   icon: Receipt },
  { href: '/dashboard/insurance',          label: 'Convênios',     icon: Shield },
  { href: '/dashboard/reports',            label: 'Relatórios',    icon: BarChart3 },
  { href: '/dashboard/settings',           label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    router.push('/login');
    toast.success('Logout realizado');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] fixed left-0 top-0 z-30 select-none transition-all duration-300 ease-in-out",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>

      {/* Header / Logo */}
      <div className={cn(
        "flex items-center gap-3 px-5 py-5 border-b border-[hsl(var(--sidebar-border))] overflow-hidden",
        sidebarCollapsed ? "justify-center px-2" : "px-5"
      )}>
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-4 h-4 text-blue-400" />
        </div>
        {!sidebarCollapsed && (
          <div className="leading-tight animate-in fade-in slide-in-from-left-2 duration-300">
            <p className="text-sm font-bold text-foreground">ClinicaOS</p>
            <p className="text-[10px] text-muted-foreground">Gestão Clínica</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group shrink-0',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 truncate animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 opacity-50" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 pb-3 border-t border-[hsl(var(--sidebar-border))] pt-3 space-y-1">
        
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all",
              sidebarCollapsed && "justify-center px-0"
            )}
            title={sidebarCollapsed ? "Alternar Tema" : undefined}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!sidebarCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Modo {theme === 'dark' ? 'Claro' : 'Escuro'}</span>}
          </button>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all",
            sidebarCollapsed && "justify-center px-0"
          )}
          title={sidebarCollapsed ? "Expandir" : "Recolher"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          {!sidebarCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Recolher menu</span>}
        </button>

        {/* User Block */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg",
          sidebarCollapsed && "justify-center px-0"
        )}>
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
            {user?.email ? getInitials(user.email.split('@')[0].replace(/[._-]/g, ' ')) : 'U'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground">
                {user?.role ? ROLE_LABELS[user.role] : ''}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all",
            sidebarCollapsed && "justify-center px-0"
          )}
          title={sidebarCollapsed ? "Sair" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Sair do sistema</span>}
        </button>
      </div>
    </aside>
  );
}
