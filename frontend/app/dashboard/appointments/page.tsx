'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { appointmentService } from '@/lib/services';
import {
  CalendarDays, Plus, Clock, CheckCircle2,
  XCircle, Timer, AlertCircle, ChevronLeft, ChevronRight,
  User, Stethoscope, MoreHorizontal, Calendar, ArrowRight,
  ClipboardList, DollarSign, Edit
} from 'lucide-react';
import {
  cn, formatTime, STATUS_LABELS, statusColor,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@/types';
import Link from 'next/link';

const FILTERS: { value: AppointmentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendados' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'IN_PROGRESS', label: 'Em Atendimento' },
  { value: 'COMPLETED', label: 'Concluídos' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { icon: any; label: string; cls: string }> = {
    SCHEDULED:   { icon: Clock, label: 'Agendado', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    CONFIRMED:   { icon: CheckCircle2, label: 'Confirmado', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    IN_PROGRESS: { icon: Timer, label: 'Em Atendimento', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    COMPLETED:   { icon: CheckCircle2, label: 'Concluído', cls: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    CANCELLED:   { icon: XCircle, label: 'Cancelado', cls: 'bg-red-500/10 text-red-600 border-red-500/20' },
    NO_SHOW:     { icon: AlertCircle, label: 'Não Compareceu', cls: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  };
  const config = map[status] || map.SCHEDULED;
  const Icon = config.icon;
  
  return (
    <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-black border uppercase gap-1.5 shadow-sm", config.cls)}>
      <Icon size={10} strokeWidth={3} />
      {config.label}
    </Badge>
  );
}

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [date, setDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const [filter, setFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClose = () => setOpenMenuId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const params: Record<string, unknown> = { page, limit: 15 };
  if (date) params.date = date;
  if (filter !== 'ALL') params.status = filter;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentService.list(params),
  });

  const appointments = data?.data ?? [];
  const meta = data?.meta;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: () => toast.error('Falha ao atualizar status'),
  });

  const nextStatus: Partial<Record<AppointmentStatus, { next: AppointmentStatus; label: string; cls: string; action?: (id: string) => void }>> = {
    SCHEDULED:   { next: 'CONFIRMED',   label: 'Confirmar', cls: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10' },
    CONFIRMED:   { 
      next: 'IN_PROGRESS', 
      label: 'Iniciar Atendimento',   
      cls: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10',
      action: (id) => router.push(`/dashboard/medical-records/new?appointmentId=${id}`)
    },
    IN_PROGRESS: { next: 'COMPLETED',   label: 'Concluir',  cls: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10' },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Agenda Diária"
        description={
          isLoading 
            ? 'Carregando agendamentos...' 
            : data 
              ? `${data.data.length} agendamentos exibidos (Total no banco: ${data.meta.total})` 
              : 'Gestão de consultas e horários'
        }
      >
        <Link href="/dashboard/appointments/new">
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 h-11 px-6 rounded-xl font-bold uppercase text-xs">
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </Link>
      </PageHeader>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            />
            {date && (
              <button 
                onClick={() => setDate('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-primary hover:text-primary/80 transition-colors bg-background px-1.5 py-0.5 rounded-md border border-primary/20 shadow-sm z-10"
              >
                Limpar
              </button>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => qc.invalidateQueries({ queryKey: ['appointments'] })}
            className="h-9 px-3 rounded-xl border-border hover:bg-muted text-[10px] font-bold uppercase gap-2"
          >
            <Clock className="w-3 h-3" /> Atualizar
          </Button>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap',
                  filter === f.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse mr-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" /> Sincronizando...
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[2rem] shadow-sm">
        <div className="overflow-visible">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Horário','Paciente','Profissional','Status','Ações'].map((h) => (
                  <th key={h} className="px-6 py-4 font-black text-muted-foreground text-[10px] uppercase tracking-[0.15em] text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Array.from({length:5}).map((_, j) => (
                        <td key={j} className="px-6 py-5">
                          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : appointments.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <div className="w-16 h-16 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-bold text-lg">Sem compromissos para este filtro</p>
                      <p className="text-xs text-muted-foreground mt-1">Sua agenda está livre!</p>
                    </td>
                  </tr>
                )
                : appointments.map((apt, index) => {
                  const action = nextStatus[apt.status];
                  return (
                    <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-foreground tabular-nums">{formatTime(apt.scheduledAt)}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{apt.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{apt.patient?.fullName ?? 'Paciente Externo'}</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase">ID: {apt.patient?.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Stethoscope size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{apt.doctor?.fullName ?? '—'}</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase">{apt.specialty?.name || 'Clínico Geral'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {action && (
                            <button
                              onClick={() => {
                                updateStatus.mutate({ id: apt.id, status: action.next });
                                if (action.action) action.action(apt.id);
                              }}
                              disabled={updateStatus.isPending}
                              className={cn('text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50', action.cls)}
                            >
                              {action.label}
                            </button>
                          )}
                          {apt.status === 'IN_PROGRESS' && (
                            <Link
                              href={`/dashboard/medical-records/new?appointmentId=${apt.id}`}
                              className="text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                            >
                              Evolução
                            </Link>
                          )}
                          {['SCHEDULED','CONFIRMED'].includes(apt.status) && (
                            <button
                              onClick={() => updateStatus.mutate({ id: apt.id, status: 'CANCELLED' })}
                              className="p-2 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-all"
                              title="Cancelar"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === apt.id ? null : apt.id);
                              }}
                              className={cn(
                                "p-2 rounded-xl border transition-all",
                                openMenuId === apt.id 
                                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                                  : "border-transparent hover:bg-muted text-muted-foreground"
                              )}
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenuId === apt.id && (
                              <div className={cn(
                                "absolute right-full mr-2 z-50 min-w-[220px] bg-card border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-right-2 zoom-in duration-200",
                                index > appointments.length - 3 && appointments.length > 2 
                                  ? "bottom-0 origin-bottom-right" 
                                  : "top-0 origin-top-right"
                              )}>
                                <div className="text-[10px] font-black uppercase text-muted-foreground px-3 py-2 mb-1 border-b border-border/50">
                                  Opções de Atendimento
                                </div>
                                
                                <Link 
                                  href={`/dashboard/patients/${apt.patientId}`}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-bold text-foreground transition-colors group/item"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                    <User size={14} />
                                  </div>
                                  Ver Perfil do Paciente
                                </Link>

                                <Link 
                                  href={`/dashboard/patients/${apt.patientId}`}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-bold text-foreground transition-colors group/item"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                                    <ClipboardList size={14} />
                                  </div>
                                  Histórico Médico
                                </Link>

                                <Link 
                                  href={`/dashboard/billing?appointmentId=${apt.id}`}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-bold text-foreground transition-colors group/item"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                                    <DollarSign size={14} />
                                  </div>
                                  Financeiro e Faturas
                                </Link>

                                <div className="h-px bg-border/50 my-1 mx-2" />

                                <button 
                                  onClick={() => toast.info('Edição de agendamento em breve')}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-bold text-foreground transition-colors text-left group/item"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover/item:bg-amber-600 group-hover/item:text-white transition-colors">
                                    <Edit size={14} />
                                  </div>
                                  Editar Agendamento
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Página {meta.page} de {meta.totalPages} <span className="mx-2 opacity-30">|</span> {meta.total} Registros
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 transition-all shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 transition-all shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
