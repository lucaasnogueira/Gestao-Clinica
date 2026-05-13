'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billService } from '@/lib/services';
import { DollarSign, Search, ChevronLeft, ChevronRight, X, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn, formatDate, formatCurrency, PAYMENT_STATUS_LABELS, paymentStatusColor, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PaymentStatus, PaymentMethod, Bill } from '@/types';
import { toast } from 'sonner';

const FILTERS: { value: PaymentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'PAID', label: 'Pagos' },
  { value: 'OVERDUE', label: 'Vencidos' },
];

export default function BillingPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  
  // State for Payment Modal
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');

  const params: Record<string, unknown> = { page, limit: 10 };
  if (search) params.search = search;
  if (filter !== 'ALL') params.status = filter;

  const { data, isLoading } = useQuery({
    queryKey: ['bills', params],
    queryFn: () => billService.list(params),
  });

  const registerMutation = useMutation({
    mutationFn: (id: string) => billService.registerPayment(id, { 
      paymentMethod, 
      amount: selectedBill?.totalAmount ?? 0 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Pagamento registrado com sucesso!');
      setSelectedBill(null);
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento.');
    }
  });

  const bills = data?.data ?? [];
  const meta = data?.meta;

  const handleOpenPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentMethod('PIX');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Faturamento"
        description={meta ? `${meta.total} conta(s) encontrada(s)` : 'Gestão financeira e cobranças'}
      />

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Buscar por paciente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 px-3.5 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
        
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
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
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Vencimento</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Paciente</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Valor Total</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <DollarSign className="w-10 h-10 mx-auto mb-3 text-muted-foreground/25" />
                    <p className="text-muted-foreground font-medium">Nenhuma conta encontrada</p>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-4 font-medium">{formatDate(bill.dueDate)}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{bill.patient?.fullName ?? '—'}</div>
                      {bill.insurance && <div className="text-[10px] text-muted-foreground">{bill.insurance.name}</div>}
                    </td>
                    <td className="px-5 py-4 font-bold text-foreground">{formatCurrency(bill.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <Badge className={paymentStatusColor(bill.status)}>
                        {PAYMENT_STATUS_LABELS[bill.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {bill.status === 'PENDING' || bill.status === 'OVERDUE' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs font-semibold border-primary/20 text-primary hover:bg-primary hover:text-white"
                          onClick={() => handleOpenPayment(bill)}
                        >
                          Pagar
                        </Button>
                      ) : (
                        <button className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors">
                          Detalhes
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
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

      {/* Simple Payment Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Registrar Pagamento
              </h3>
              <button 
                onClick={() => setSelectedBill(null)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Valor a Receber</div>
                <div className="text-3xl font-black text-primary">{formatCurrency(selectedBill.totalAmount)}</div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">
                  Paciente: <span className="text-foreground">{selectedBill.patient?.fullName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Método de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                        paymentMethod === method 
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" 
                          : "border-border hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <CreditCard className={cn("w-4 h-4", paymentMethod === method ? "text-primary" : "text-muted-foreground")} />
                      {PAYMENT_METHOD_LABELS[method]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-bold"
                onClick={() => setSelectedBill(null)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 h-12 rounded-xl font-bold gap-2"
                onClick={() => registerMutation.mutate(selectedBill.id)}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
