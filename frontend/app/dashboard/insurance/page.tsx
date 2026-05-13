'use client';

import { useQuery } from '@tanstack/react-query';
import { insuranceService } from '@/lib/services';
import { Building2, Phone, Mail, CheckCircle2, XCircle, Search, Plus, Eye, Edit } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function InsurancePage() {
  const [search, setSearch] = useState('');
  
  const { data: insurances = [], isLoading } = useQuery({
    queryKey: ['insurances'],
    queryFn: insuranceService.list,
  });

  const filtered = insurances.filter(ins => 
    ins.name.toLowerCase().includes(search.toLowerCase()) || 
    ins.ansCode?.includes(search)
  );

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <PageHeader
        title="Convênios"
        description={`${insurances.length} operadoras credenciadas`}
      >
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
          <Plus size={16} /> Novo Convênio
        </Button>
      </PageHeader>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome ou código ANS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition-all text-sm shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Operadora', 'Código ANS', 'Contato', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-muted-foreground text-[10px] uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-muted animate-pulse rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-20 text-center">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                      <p className="text-muted-foreground font-medium">Nenhum convênio encontrado</p>
                    </td>
                  </tr>
                )
                : filtered.map((ins) => (
                  <tr
                    key={ins.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <Building2 size={18} />
                        </div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{ins.name}</p>
                      </div>
                    </td>

                    {/* ANS */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
                        {ins.ansCode || '—'}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {ins.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                            <Phone className="w-3 h-3" /> {ins.phone}
                          </div>
                        )}
                        {ins.email && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <Mail className="w-3 h-3" /> {ins.email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border shadow-sm",
                        ins.isActive 
                          ? "bg-green-500/10 text-green-600 border-green-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      )}>
                        {ins.isActive ? 'ATIVO' : 'INATIVO'}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          className="p-2 hover:bg-gray-100 text-muted-foreground hover:text-primary rounded-xl transition-all border border-transparent hover:border-gray-200"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 text-muted-foreground hover:text-amber-600 rounded-xl transition-all border border-transparent hover:border-gray-200"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
