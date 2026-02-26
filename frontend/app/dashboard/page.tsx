'use client';

import { useQuery } from '@tanstack/react-query';
import { appointmentService, patientService } from '@/lib/services';
import {
  CalendarDays, Users, TrendingUp, Clock,
  CheckCircle2, XCircle, Timer, AlertCircle,
} from 'lucide-react';
import {
  formatTime, formatDate, STATUS_LABELS, statusColor, cn, formatCurrency,
} from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import type { Appointment, AppointmentStatus } from '@/types';

// ========================
// STAT CARD
// ========================
function StatCard({ label, value, icon: Icon, colorClass, sub }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ========================
// STATUS ICON
// ========================
function ApptStatusIcon({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, React.ReactNode> = {
    SCHEDULED:   <Clock className="w-3.5 h-3.5 text-blue-500" />,
    CONFIRMED:   <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
    IN_PROGRESS: <Timer className="w-3.5 h-3.5 text-amber-500" />,
    COMPLETED:   <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    CANCELLED:   <XCircle className="w-3.5 h-3.5 text-red-500" />,
    NO_SHOW:     <AlertCircle className="w-3.5 h-3.5 text-gray-400" />,
  };
  return <>{map[status]}</>;
}

// ========================
// PAGE
// ========================
export default function DashboardPage() {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const { data: todayAppts = [], isLoading: loadingAppts } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: appointmentService.today,
    refetchInterval: 30_000,
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'meta'],
    queryFn: () => patientService.list({ limit: 1 }),
  });

  const totalPatients = patientsData?.meta?.total ?? 0;
  const completed   = todayAppts.filter((a) => a.status === 'COMPLETED').length;
  const inProgress  = todayAppts.filter((a) => a.status === 'IN_PROGRESS').length;
  const pending     = todayAppts.filter((a) => ['SCHEDULED', 'CONFIRMED'].includes(a.status)).length;
  const occupancy   = todayAppts.length > 0 ? Math.round((completed / todayAppts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Visão geral do dia — ${today}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Consultas Hoje"
          value={todayAppts.length}
          icon={CalendarDays}
          colorClass="bg-blue-50 text-blue-600"
          sub={`${completed} concluídas · ${pending} pendentes`}
        />
        <StatCard
          label="Pacientes Cadastrados"
          value={totalPatients.toLocaleString('pt-BR')}
          icon={Users}
          colorClass="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Taxa de Ocupação"
          value={`${occupancy}%`}
          icon={TrendingUp}
          colorClass="bg-emerald-50 text-emerald-600"
          sub="do dia atual"
        />
        <StatCard
          label="Em Atendimento Agora"
          value={inProgress}
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600"
          sub={`${pending} aguardando`}
        />
      </div>

      {/* Today's agenda */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Agenda de Hoje</h2>
          <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">
            {todayAppts.length} consulta{todayAppts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loadingAppts ? (
          <div className="p-10 text-center">
            <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm mt-3">Carregando agenda...</p>
          </div>
        ) : todayAppts.length === 0 ? (
          <div className="p-14 text-center">
            <CalendarDays className="w-11 h-11 text-muted-foreground/25 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">Nenhuma consulta agendada para hoje</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {todayAppts.map((apt: Appointment, i) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Time */}
                <div className="text-center min-w-[52px]">
                  <p className="text-sm font-bold tabular-nums text-foreground">{formatTime(apt.scheduledAt)}</p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">{formatTime(apt.endsAt)}</p>
                </div>

                <div className="w-px h-8 bg-border flex-shrink-0" />

                {/* Patient + doctor */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {apt.patient?.fullName ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {apt.doctor?.fullName}
                    {apt.specialty?.name ? ` · ${apt.specialty.name}` : ''}
                  </p>
                </div>

                {/* Convênio */}
                {apt.insurance && (
                  <span className="hidden sm:block text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[100px]">
                    {apt.insurance.name}
                  </span>
                )}

                {/* Status */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <ApptStatusIcon status={apt.status} />
                  <Badge className={statusColor(apt.status)}>
                    {STATUS_LABELS[apt.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
