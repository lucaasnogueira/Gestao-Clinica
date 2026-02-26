'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/lib/services';
import {
  CalendarDays, Plus, Clock, CheckCircle2,
  XCircle, Timer, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  cn, formatTime, STATUS_LABELS, statusColor,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@/types';
import Link from 'next/link';

const FILTERS: { value: AppointmentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Faltou' },
];

function StatusIcon({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, React.ReactNode> = {
    SCHEDULED:   <Clock className="w-4 h-4 text-blue-500" />,
    CONFIRMED:   <CheckCircle2 className="w-4 h-4 text-green-500" />,
    IN_PROGRESS: <Timer className="w-4 h-4 text-amber-500" />,
    COMPLETED:   <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    CANCELLED:   <XCircle className="w-4 h-4 text-red-500" />,
    NO_SHOW:     <AlertCircle className="w-4 h-4 text-gray-400" />,
  };
  return <>{map[status]}</>;
}

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const [date, setDate]   = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [page, setPage]   = useState(1);

  const params: Record<string, unknown> = { date, page, limit: 20 };
  if (filter !== 'ALL') params.status = filter;

  const { data, isLoading } = useQuery({
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
      toast.success('Status atualizado');
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  const nextStatus: Partial<Record<AppointmentStatus, { next: AppointmentStatus; label: string; cls: string }>> = {
    SCHEDULED:   { next: 'CONFIRMED',   label: 'Confirmar', cls: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
    CONFIRMED:   { next: 'IN_PROGRESS', label: 'Iniciar',   cls: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    IN_PROGRESS: { next: 'COMPLETED',   label: 'Concluir',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Agendamentos"
        description={meta ? `${meta.total} consulta(s) encontrada(s)` : ''}
      >
        <Link
          href="/dashboard/appointments/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                filter === f.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Horário','Paciente','Médico','Especialidade','Status','Ações'].map((h) => (
                  <th key={h} className={cn(
                    'px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide',
                    h === 'Ações' ? 'text-right' : 'text-left',
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Array.from({length:6}).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : appointments.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <CalendarDays className="w-10 h-10 mx-auto mb-3 text-muted-foreground/25" />
                      <p className="text-muted-foreground font-medium">Nenhuma consulta encontrada</p>
                      <p className="text-xs text-muted-foreground mt-1">Tente outro filtro ou data</p>
                    </td>
                  </tr>
                )
                : appointments.map((apt) => {
                  const action = nextStatus[apt.status];
                  return (
                    <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-muted/25 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold tabular-nums">{formatTime(apt.scheduledAt)}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{formatTime(apt.endsAt)}</p>
                      </td>
                      <td className="px-5 py-4 font-medium">{apt.patient?.fullName ?? '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground">{apt.doctor?.fullName ?? '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground">{apt.specialty?.name ?? apt.type}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={apt.status} />
                          <Badge className={statusColor(apt.status)}>{STATUS_LABELS[apt.status]}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {action && (
                            <button
                              onClick={() => updateStatus.mutate({ id: apt.id, status: action.next })}
                              disabled={updateStatus.isPending}
                              className={cn('text-xs px-2.5 py-1 rounded-md border transition-colors', action.cls)}
                            >
                              {action.label}
                            </button>
                          )}
                          {['SCHEDULED','CONFIRMED'].includes(apt.status) && (
                            <button
                              onClick={() => updateStatus.mutate({ id: apt.id, status: 'CANCELLED' })}
                              className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">Página {meta.page} de {meta.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === meta.totalPages}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
