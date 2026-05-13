'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, UserRound, Phone, Clock, 
  DollarSign, Award, ChevronLeft, ChevronRight, X, Edit, Eye,
  Stethoscope
} from 'lucide-react';
import { 
  cn, formatCurrency, formatPhone,
} from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { useDoctorList } from '@/hooks/useDoctors';
import { InlineDoctorForm } from '@/components/doctors/InlineDoctorForm';
import { Button } from '@/components/ui/button';
import type { Doctor } from '@/types';

export default function DoctorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // CRUD States
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Doctor | null>(null);

  const { data, isLoading, isFetching } = useDoctorList({ 
    page, 
    limit, 
    search: search || undefined 
  });

  const doctors = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (d: Doctor) => {
    setEditingItem(d);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <PageHeader
        title="Médicos"
        description={
          meta ? `${meta.total.toLocaleString('pt-BR')} médicos cadastrados` : 'Gerenciar corpo clínico'
        }
      >
        <Button
          onClick={() => { setIsAdding(!isAdding); setEditingItem(null); }}
          className={cn('gap-2 transition-all',
            isAdding ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
          )}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Cancelar' : 'Novo Médico'}
        </Button>
      </PageHeader>

      {/* Inline Form */}
      {isAdding && (
        <InlineDoctorForm 
          onClose={() => { setIsAdding(false); setEditingItem(null); }} 
          editingItem={editingItem} 
        />
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome ou CRM..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/50 transition-all text-sm shadow-sm"
        />
        {isFetching && !isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Médico', 'CRM', 'Contato', 'Especialidades', 'Valor', 'Ações'].map((h) => (
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
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-muted animate-pulse rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : doctors.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center">
                      <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                      <p className="text-muted-foreground font-medium">Nenhum médico encontrado</p>
                    </td>
                  </tr>
                )
                : doctors.map((d: Doctor) => (
                  <tr
                    key={d.id}
                    className="border-b border-border last:border-0 hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-5 py-4" onClick={() => router.push(`/dashboard/doctors/${d.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-xs font-black text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {d.fullName.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-blue-600 transition-colors">{d.fullName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">{d.user?.email || 'Sem e-mail'}</p>
                        </div>
                      </div>
                    </td>

                    {/* CRM */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
                        {d.crm} / {d.crmState}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono">{formatPhone(d.phone)}</span>
                      </div>
                    </td>

                    {/* Specialties */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {d.specialties && d.specialties.length > 0 ? (
                          d.specialties.map((s) => (
                            <span key={s.specialty.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                              {s.specialty.name}
                            </span>
                          ))
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground">{formatCurrency(Number(d.consultPrice))}</p>
                      <p className="text-[10px] text-muted-foreground">{d.consultDuration} min</p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => router.push(`/dashboard/doctors/${d.id}`)}
                          className="p-2 hover:bg-blue-50 text-muted-foreground hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(d)}
                          className="p-2 hover:bg-amber-50 text-muted-foreground hover:text-amber-600 rounded-xl transition-all border border-transparent hover:border-amber-100"
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

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground font-medium">
              Mostrando {doctors.length} de {meta.total} médicos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 1}
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setPage((p) => Math.min(meta.totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === meta.totalPages}
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
