'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, User, Phone, Calendar, 
  AlertTriangle, ChevronLeft, ChevronRight, X, Edit, Eye
} from 'lucide-react';
import { 
  cn, formatDate, formatAge, formatCPF, formatPhone,
  BLOOD_TYPE_LABELS,
} from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { usePatientList } from '@/hooks/usePatients';
import { InlinePatientForm } from '@/components/patients/InlinePatientForm';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  // CRUD States
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Patient | null>(null);

  const { data, isLoading, isFetching } = usePatientList({ 
    page, 
    limit, 
    search: search || undefined 
  });

  const patients = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (p: Patient) => {
    setEditingItem(p);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <PageHeader
        title="Pacientes"
        description={
          meta ? `${meta.total.toLocaleString('pt-BR')} pacientes cadastrados` : 'Gerenciar pacientes'
        }
      >
        <Button
          onClick={() => { setIsAdding(!isAdding); setEditingItem(null); }}
          className={cn('gap-2 transition-all',
            isAdding ? 'bg-gray-500 hover:bg-gray-600' : 'bg-primary hover:bg-primary/90'
          )}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Cancelar' : 'Novo Paciente'}
        </Button>
      </PageHeader>

      {/* Inline Form */}
      {isAdding && (
        <InlinePatientForm 
          onClose={() => { setIsAdding(false); setEditingItem(null); }} 
          editingItem={editingItem} 
        />
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou telefone..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring/50 transition-all text-sm"
        />
        {isFetching && !isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Paciente', 'Contato', 'Nascimento', 'Tipo Sang.', 'Alertas', 'Convênio', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-muted animate-pulse rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : patients.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <User className="w-10 h-10 mx-auto mb-3 text-muted-foreground/25" />
                      <p className="text-muted-foreground font-medium">Nenhum paciente encontrado</p>
                      {search && <p className="text-xs text-muted-foreground mt-1">Tente outro termo</p>}
                    </td>
                  </tr>
                )
                : patients.map((p: Patient) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-muted/25 transition-colors group"
                  >
                    {/* Name + CPF */}
                    <td className="px-5 py-3.5" onClick={() => router.push(`/dashboard/patients/${p.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          {p.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.fullName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{formatCPF(p.cpf)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs font-mono">{formatPhone(p.phone)}</span>
                      </div>
                      {p.email && <p className="text-xs text-muted-foreground mt-0.5 max-w-[160px] truncate">{p.email}</p>}
                    </td>

                    {/* DOB */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">{formatDate(p.dateOfBirth)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatAge(p.dateOfBirth)}</p>
                    </td>

                    {/* Blood */}
                    <td className="px-5 py-3.5">
                      {p.bloodType
                        ? <span className="text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full uppercase">{BLOOD_TYPE_LABELS[p.bloodType]}</span>
                        : <span className="text-muted-foreground text-xs">—</span>
                      }
                    </td>

                    {/* Alerts */}
                    <td className="px-5 py-3.5">
                      {(p.allergies.length > 0 || p.chronicConditions.length > 0) ? (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs text-amber-700">
                            {p.allergies.length > 0 && `${p.allergies.length} alerg.`}
                            {p.allergies.length > 0 && p.chronicConditions.length > 0 && ' · '}
                            {p.chronicConditions.length > 0 && `${p.chronicConditions.length} crôn.`}
                          </span>
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>

                    {/* Insurance */}
                    <td className="px-5 py-3.5">
                      {p.insurance
                        ? <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full uppercase">{p.insurance.name}</span>
                        : <span className="text-muted-foreground text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full">Particular</span>
                      }
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/patients/${p.id}`)}
                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-gray-200"
                          title="Ver Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-amber-600 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                          title="Editar"
                        >
                          <Edit size={16} />
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Página {meta.page} de {meta.totalPages} · {meta.total} registros
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === 1}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setPage((p) => Math.min(meta.totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page === meta.totalPages}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
