'use client';

import { useQuery } from '@tanstack/react-query';
import { insuranceService } from '@/lib/services';
import { Building2, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';

export default function InsurancePage() {
  const { data: insurances = [], isLoading } = useQuery({
    queryKey: ['insurances'],
    queryFn: insuranceService.list,
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Convênios"
        description="Operadoras de planos de saúde credenciadas"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <div className="h-3 bg-muted animate-pulse rounded w-full" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </div>
          ))
        ) : insurances.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-xl p-14 text-center text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/25" />
            <p className="font-medium">Nenhum convênio cadastrado</p>
          </div>
        ) : (
          insurances.map((ins) => (
            <div key={ins.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{ins.name}</h3>
                    <p className="text-xs text-muted-foreground">ANS: {ins.ansCode ?? 'Não inf.'}</p>
                  </div>
                </div>
                <Badge className={ins.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                  {ins.isActive ? (
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ativo</span>
                  ) : (
                    <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Inativo</span>
                  )}
                </Badge>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-border">
                {ins.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{ins.phone}</span>
                  </div>
                )}
                {ins.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{ins.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
