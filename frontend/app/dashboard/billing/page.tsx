'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billService } from '@/lib/services';
import { DollarSign, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn, formatDate, formatCurrency, PAYMENT_STATUS_LABELS, paymentStatusColor } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import type { PaymentStatus } from '@/types';

const FILTERS: { value: PaymentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'PAID', label: 'Pagos' },
  { value: 'OVERDUE', label: 'Vencidos' },
];

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const params: Record<string, unknown> = { page, limit: 10 };
  if (search) params.search = search;
  if (filter !== 'ALL') params.status = filter;

  const { data, isLoading } = useQuery({
    queryKey: ['bills', params],
    queryFn: () => billService.list(params),
  });

  const bills = data?.data ?? [];
  const meta = data?.meta;

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
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Vencimento</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Paciente</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Valor Total</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide uppercase tracking-wide text-right">Ações</th>
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
                  <tr key={bill.id} className="border-b border-border last:border-0 hover:bg-muted/25 transition-colors">
                    <td className="px-5 py-4 font-medium">{formatDate(bill.dueDate)}</td>
                    <td className="px-5 py-4">{bill.patient?.fullName ?? '—'}</td>
                    <td className="px-5 py-4 font-bold">{formatCurrency(bill.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <Badge className={paymentStatusColor(bill.status)}>
                        {PAYMENT_STATUS_LABELS[bill.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-xs font-semibold text-primary hover:underline">
                        Ver Fatura
                      </button>
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
    </div>
  );
}
