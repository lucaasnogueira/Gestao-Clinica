'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Stethoscope, Loader2 } from 'lucide-react';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormData) => {
    try {
      const result = await authService.login(email, password);
      setAuth(
        { id: result.user.id, email: result.user.email, role: result.user.role as Role },
        result.accessToken,
        result.refreshToken,
      );
      toast.success('Bem-vindo(a) de volta!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Credenciais inválidas. Verifique e tente novamente.');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/25 mb-5">
          <Stethoscope className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">ClinicaOS</h1>
        <p className="text-slate-500 text-sm mt-1">Sistema de Gerenciamento de Clínicas</p>
      </div>

      {/* Card */}
      <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/30">
        <h2 className="text-lg font-semibold text-white mb-6">Entrar na sua conta</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              {...register('email')}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-sm"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 mt-6 shadow-lg shadow-blue-900/40"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>

      {/* Demo hint */}
      <div className="mt-5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <p className="text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wide">Credenciais de demonstração</p>
        <div className="space-y-1 text-xs font-mono text-slate-400">
          <p>admin@clinica.com / Admin@123</p>
          <p>recepcao@clinica.com / Recepcao@123</p>
        </div>
      </div>

      <p className="text-center text-slate-700 text-xs mt-6">
        ClinicaOS v1.0 — Dados protegidos por LGPD
      </p>
    </div>
  );
}
