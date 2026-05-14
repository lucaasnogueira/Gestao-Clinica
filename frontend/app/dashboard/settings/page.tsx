'use client';

import { useAuthStore } from '@/store/auth.store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/lib/services';
import { toast } from 'sonner';
import { User, Lock, Shield, Bell, Save, Loader2 } from 'lucide-react';
import { cn, ROLE_LABELS } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const input = 'w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring/50 transition-all';

export default function SettingsPage() {
  const { user } = useAuthStore();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      reset();
    },
    onError: (err: any) => 
      toast.error(err?.response?.data?.message || 'Erro ao alterar senha'),
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Configurações"
        description="Gerencie seu perfil e preferências de segurança"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Tabs (Conceptual) */}
        <div className="space-y-1">
          {[
            { id: 'profile', label: 'Meu Perfil', icon: User },
            { id: 'security', label: 'Segurança', icon: Lock, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
            { id: 'notifications', label: 'Notificações', icon: Bell },
            { id: 'permissions', label: 'Permissões', icon: Shield, roles: ['ADMIN'] },
          ]
          .filter(item => !item.roles || (user?.role && item.roles.includes(user.role as any)))
          .map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                item.id === 'profile' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Perfil do Usuário
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">E-mail</label>
                  <div className="px-3.5 py-2 rounded-lg border border-border bg-muted/50 text-sm text-foreground">
                    {user?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Nível de Acesso</label>
                  <div className="px-3.5 py-2 rounded-lg border border-border bg-muted/50 text-sm text-foreground font-medium">
                    {user ? ROLE_LABELS[user.role] : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          {user?.role !== 'DEMO' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Alterar Senha
              </h3>
              <form onSubmit={handleSubmit((d) => changePasswordMutation.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Senha Atual</label>
                  <input {...register('currentPassword')} type="password" className={input} placeholder="••••••••" />
                  {errors.currentPassword && <p className="text-destructive text-xs mt-1">{errors.currentPassword.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nova Senha</label>
                    <input {...register('newPassword')} type="password" className={input} placeholder="••••••••" />
                    {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirmar Nova Senha</label>
                    <input {...register('confirmPassword')} type="password" className={input} placeholder="••••••••" />
                    {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm"
                  >
                    {changePasswordMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Atualizar Senha</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Section (Placeholder) */}
          <div className="bg-card border border-border rounded-xl p-6 opacity-60">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Preferências de Notificação
            </h3>
            <div className="space-y-3">
              {[
                'Receber alertas de novos agendamentos',
                'Notificar por e-mail sobre faturas vencidas',
                'Alertas de sistema e atualizações',
              ].map((pref, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-5 bg-muted rounded-full relative flex-shrink-0">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                  <span className="text-sm">{pref}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
