'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/lib/services';
import { 
  Target, Plus, Trash2, Calendar, 
  TrendingUp, Users, CalendarDays,
  Search, Filter, ChevronRight
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const GOAL_TYPES = [
  { value: 'REVENUE', label: 'Faturamento', icon: TrendingUp, color: 'text-amber-500' },
  { value: 'PATIENTS', label: 'Novos Pacientes', icon: Users, color: 'text-blue-500' },
  { value: 'APPOINTMENTS', label: 'Agendamentos', icon: CalendarDays, color: 'text-emerald-500' },
];

import { useAuthStore } from '@/store/auth.store';

export default function GoalsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'REVENUE',
    month: new Date().toISOString().substring(0, 7),
    targetValue: 0,
  });

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.list(),
  });

  const upsertMutation = useMutation({
    mutationFn: goalService.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Meta salva com sucesso!');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Erro ao salvar meta.'),
  });

  const deleteMutation = useMutation({
    mutationFn: goalService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Meta removida!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
      ...formData,
      targetValue: Number(formData.targetValue),
    });
  };

  const goals = goalsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gerenciar Metas"
        description="Defina indicadores de desempenho para sua clínica"
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </PageHeader>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Buscar metas..." 
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Indicador</th>
                <th className="px-6 py-4">Mês</th>
                <th className="px-6 py-4">Valor Alvo</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {goals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Target className="w-12 h-12 mb-2 opacity-10" />
                      <p>Nenhuma meta definida ainda.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-primary text-sm mt-2 hover:underline"
                      >
                        Clique aqui para criar a primeira
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                goals.map((goal: any) => {
                  const typeInfo = GOAL_TYPES.find(t => t.value === goal.type);
                  const Icon = typeInfo?.icon || Target;
                  
                  return (
                    <tr key={goal.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm", typeInfo?.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{typeInfo?.label || goal.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {goal.month}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold">
                          {goal.type === 'REVENUE' ? formatCurrency(goal.targetValue) : goal.targetValue}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(goal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user?.role !== 'DEMO' && (
                          <button 
                            onClick={() => deleteMutation.mutate(goal.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Definir Nova Meta
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Indicador</label>
                <select 
                  className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  {GOAL_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mês de Referência</label>
                <input 
                  type="month"
                  className="w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.month}
                  onChange={e => setFormData({...formData, month: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Alvo</label>
                <div className="relative">
                  {formData.type === 'REVENUE' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                  )}
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="Ex: 50000"
                    className={cn(
                      "w-full p-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20",
                      formData.type === 'REVENUE' && "pl-10"
                    )}
                    value={formData.targetValue}
                    onChange={e => setFormData({...formData, targetValue: Number(e.target.value)})}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Valor acumulado que deseja atingir no mês.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={upsertMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {upsertMutation.isPending ? 'Salvando...' : 'Salvar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
