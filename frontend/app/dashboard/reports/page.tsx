'use client';

import { useQuery } from '@tanstack/react-query';
import { appointmentService, patientService, billService } from '@/lib/services';
import {
  CalendarDays, Users, TrendingUp, DollarSign,
  BarChart, PieChart, Activity, Download
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';

function ReportCard({ label, value, icon: Icon, colorClass, sub }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow animate-fade-in text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'meta'],
    queryFn: () => patientService.list({ limit: 1 }),
  });

  const { data: billsData } = useQuery({
    queryKey: ['bills', 'meta'],
    queryFn: () => billService.list({ limit: 1 }),
  });

  const { data: todayAppts = [] } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: appointmentService.today,
  });

  const totalPatients = patientsData?.meta?.total ?? 0;
  const totalBills = billsData?.meta?.total ?? 0;
  const apptsCount = todayAppts.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Relatórios"
        description="Indicadores e análises gerenciais da clínica"
      >
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium text-sm hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </PageHeader>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          label="Total de Pacientes"
          value={totalPatients}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
          sub="+12% este mês"
        />
        <ReportCard
          label="Agendamentos Hoje"
          value={apptsCount}
          icon={CalendarDays}
          colorClass="bg-emerald-50 text-emerald-600"
          sub="85% confirmados"
        />
        <ReportCard
          label="Faturamento Mensal"
          value={formatCurrency(45250.00)}
          icon={DollarSign}
          colorClass="bg-amber-50 text-amber-600"
          sub="Previsto: R$ 52.000"
        />
        <ReportCard
          label="Taxa de Retorno"
          value="64%"
          icon={Activity}
          colorClass="bg-violet-50 text-violet-600"
          sub="Média do setor: 58%"
        />
      </div>

      {/* Charts Placeholder Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary" />
              Volume de Atendimentos
            </h3>
            <select className="text-xs bg-muted border-none rounded px-2 py-1 outline-none">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <BarChart className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-sm">Gráfico de barras — Volume por dia</p>
            <p className="text-xs mt-1">Dados em tempo real</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Especialidades mais Procuradas
            </h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <PieChart className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-sm">Gráfico de pizza — Distribuição</p>
            <p className="text-xs mt-1">Baseado em agendamentos</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini-Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-4">Metas do Mês</h3>
        <div className="space-y-4">
          {[
            { label: 'Novos Pacientes', current: 42, target: 50, color: 'bg-blue-500' },
            { label: 'Faturamento', current: 75, target: 100, color: 'bg-emerald-500' },
            { label: 'Consultas Realizadas', current: 156, target: 200, color: 'bg-amber-500' },
          ].map((meta) => (
            <div key={meta.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>{meta.label}</span>
                <span className="text-muted-foreground">{meta.current}% de {meta.target}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", meta.color)} 
                  style={{ width: `${(meta.current / meta.target) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
