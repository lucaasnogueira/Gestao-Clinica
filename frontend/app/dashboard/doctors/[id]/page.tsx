'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { doctorService } from '@/lib/services';
import {
  ArrowLeft, Phone, Clock, DollarSign,
  Calendar, Award, User, FileText,
  Edit, Stethoscope, Mail, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import {
  cn, formatCurrency, formatPhone,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useDoctorDetail } from '@/hooks/useDoctors';

function Card({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/30">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string | null | number; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={cn('text-sm mt-1.5', mono ? 'font-mono' : 'font-semibold text-foreground', !value && 'text-muted-foreground')}>
        {value || '—'}
      </p>
    </div>
  );
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: doctor, isLoading } = useDoctorDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20 bg-card border border-border rounded-3xl">
        <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
        <p className="text-muted-foreground font-medium">Médico não encontrado</p>
        <button onClick={() => router.back()} className="text-blue-600 text-sm mt-4 font-bold hover:underline">
          ← Voltar para listagem
        </button>
      </div>
    );
  }

  const initials = doctor.fullName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header Card */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-card border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
        
        <div className="flex items-center gap-8 relative z-10">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-foreground">{doctor.fullName}</h1>
                {!doctor.isActive && <Badge variant="destructive">Inativo</Badge>}
              </div>
              <div className="flex items-center gap-4 mt-2.5">
                <Badge variant="outline" className="font-mono text-xs tracking-wider px-3 py-1 bg-background border-blue-200 text-blue-700">
                  CRM {doctor.crm} — {doctor.crmState}
                </Badge>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{doctor.user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href={`/dashboard/doctors/${id}/edit`}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Edit className="w-4 h-4" />
            Editar Perfil
          </Link>
        </div>
      </div>

      {/* Master Container */}
      <div className="bg-card/50 border border-border p-8 rounded-[2.5rem] shadow-sm space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── Left col ─── */}
          <div className="lg:col-span-2 space-y-8">

            <Card title="Dados Profissionais" icon={Award}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <InfoRow label="Telefone de Contato" value={formatPhone(doctor.phone)} mono />
                <InfoRow label="Tempo de Casa" value={`${new Date().getFullYear() - new Date(doctor.createdAt).getFullYear()} anos`} />
                
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Especialidades Atuantes</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties?.map((s) => (
                      <span key={s.specialty.id} className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                        {s.specialty.name}
                      </span>
                    )) || <span className="text-muted-foreground text-sm italic">Nenhuma especialidade vinculada</span>}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Configurações de Agenda" icon={Clock}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="p-3 rounded-xl bg-background text-blue-600 shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Duração da Consulta</p>
                    <p className="text-lg font-black">{doctor.consultDuration} minutos</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="p-3 rounded-xl bg-background text-green-600 shadow-sm">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Valor da Consulta</p>
                    <p className="text-lg font-black">{formatCurrency(Number(doctor.consultPrice))}</p>
                  </div>
                </div>
              </div>
            </Card>

            {doctor.bio && (
              <Card title="Biografia e Experiência" icon={FileText}>
                <p className="text-sm text-foreground leading-relaxed font-medium bg-muted/20 p-4 rounded-2xl border border-border/30 italic">
                  "{doctor.bio}"
                </p>
              </Card>
            )}
          </div>

          {/* ─── Right col ─── */}
          <div className="space-y-8">
            <Card title="Horários de Atendimento" icon={Calendar}>
              {doctor.schedules?.length ? (
                <div className="space-y-3">
                  {doctor.schedules.map((s) => (
                    <div key={s.id} className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      s.isActive ? "bg-background border-border" : "opacity-40 grayscale bg-muted"
                    )}>
                      <span className="text-xs font-bold">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][s.dayOfWeek]}</span>
                      <span className="text-xs font-mono font-bold text-blue-600">{s.startTime} — {s.endTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-4">Agenda não configurada</p>
              )}
            </Card>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mb-12 -mr-12" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Ações Administrativas</p>
              <div className="space-y-3 relative z-10">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm"
                >
                  Configurar Agenda
                  <ChevronRight size={16} />
                </button>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm"
                >
                  Relatório de Produção
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
