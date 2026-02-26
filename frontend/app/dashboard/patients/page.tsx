'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { patientService } from '@/lib/services';
import {
  Search, Plus, User, Phone, Calendar,
  AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  cn, formatDate, formatAge, formatCPF, formatPhone,
  BLOOD_TYPE_LABELS,
} from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import Link from 'next/link';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => patientService.list({ page, limit, search: search || undefined }),
    placeholderData: (prev) => prev,
  });

  const patients = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Pacientes"
        description={
          meta ? `${meta.total.toLocaleString('pt-BR')} pacientes cadastrados` : 'Gerenciar pacientes'
        }
      >
        <Link
          href="/dashboard/patients/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Link>
      </PageHeader>

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
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Paciente', 'Contato', 'Nascimento', 'Tipo Sang.', 'Alertas', 'Convênio', ''].map((h) => (
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
                    onClick={() => router.push(`/dashboard/patients/${p.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/25 cursor-pointer transition-colors"
                  >
                    {/* Name + CPF */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {p.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p.fullName}</p>
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
                        ? <span className="text-xs font-bold font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded">{BLOOD_TYPE_LABELS[p.bloodType]}</span>
                        : <span className="text-muted-foreground text-xs">—</span>
                      }
                    </td>

                    {/* Alerts */}
                    <td className="px-5 py-3.5">
                      {(p.allergies.length > 0 || p.chronicConditions.length > 0) ? (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="text-xs text-amber-700">
                            {p.allergies.length > 0 && `${p.allergies.length} alergia(s)`}
                            {p.allergies.length > 0 && p.chronicConditions.length > 0 && ' · '}
                            {p.chronicConditions.length > 0 && `${p.chronicConditions.length} crônica(s)`}
                          </span>
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>

                    {/* Insurance */}
                    <td className="px-5 py-3.5">
                      {p.insurance
                        ? <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">{p.insurance.name}</span>
                        : <span className="text-muted-foreground text-xs">Particular</span>
                      }
                    </td>

                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/dashboard/patients/${p.id}`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Ver
                      </Link>
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
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
