'use client';

import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/lib/services';
import {
  CalendarDays, Users, TrendingUp, DollarSign,
  BarChart, PieChart, Activity, Download, Target, ChevronRight
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import Link from 'next/link';

import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

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
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: reportService.getStats,
  });

  const stats = reportData?.stats || {
    totalPatients: 0,
    todayAppts: 0,
    monthlyRevenue: 0,
    returnRate: 0,
  };

  const goals = reportData?.goals || [];
  const volumeData = reportData?.charts?.volume || [];
  const specialtiesData = reportData?.charts?.specialties || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Relatórios"
        description="Indicadores e análises gerenciais da clínica"
      >
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/reports/goals"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium text-sm hover:bg-muted transition-colors"
          >
            <Target className="w-4 h-4" />
            Gerenciar Metas
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </PageHeader>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          label="Total de Pacientes"
          value={stats.totalPatients}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          sub="Pacientes ativos"
        />
        <ReportCard
          label="Agendamentos Hoje"
          value={stats.todayAppts}
          icon={CalendarDays}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
          sub="Hoje"
        />
        <ReportCard
          label="Faturamento Mensal"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
          sub="Mês atual"
        />
        <ReportCard
          label="Taxa de Retorno"
          value={`${stats.returnRate}%`}
          icon={Activity}
          colorClass="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"
          sub="Pacientes recorrentes"
        />
      </div>

      {/* Charts Section */}
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
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <ReTooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Especialidades mais Procuradas
            </h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={specialtiesData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {specialtiesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground">Metas do Mês</h3>
          <Link href="/dashboard/reports/goals" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            Ver detalhes <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <p>Nenhuma meta definida para este mês.</p>
              <Link href="/dashboard/reports/goals" className="text-primary mt-2 inline-block">Definir metas agora</Link>
            </div>
          ) : (
            goals.map((meta: any) => {
              const label = meta.type === 'REVENUE' ? 'Faturamento' : 
                          meta.type === 'PATIENTS' ? 'Novos Pacientes' : 'Consultas Realizadas';
              const color = meta.type === 'REVENUE' ? 'bg-amber-500' :
                           meta.type === 'PATIENTS' ? 'bg-blue-500' : 'bg-emerald-500';
              
              const currentVal = meta.type === 'REVENUE' ? formatCurrency(meta.currentValue) : meta.currentValue;
              const targetVal = meta.type === 'REVENUE' ? formatCurrency(meta.targetValue) : meta.targetValue;

              return (
                <div key={meta.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", color)} />
                      {label}
                    </span>
                    <span className="text-muted-foreground">
                      {currentVal} de {targetVal} ({Math.round(meta.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", color)} 
                      style={{ width: `${Math.min(meta.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
