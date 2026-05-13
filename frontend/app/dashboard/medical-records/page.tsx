'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicalRecordService } from '@/lib/services';
import { FileText, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function MedicalRecordsPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['medical-records', { page, search, patientId }],
    queryFn: () => medicalRecordService.list({ page, search, patientId, limit: 10 }),
  });

  const records = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Prontuários"
        description={meta ? `${meta.total} registro(s) encontrado(s)` : 'Histórico clínico dos pacientes'}
      />

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Buscar por paciente ou diagnóstico..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 px-3.5 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Paciente</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Médico</th>
                <th className="px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Queixa Principal</th>
                <th className="relative px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide text-right">Ações</th>
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
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/25" />
                    <p className="text-muted-foreground font-medium">Nenhum prontuário encontrado</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/25 transition-colors">
                    <td className="px-5 py-4 font-medium">{formatDate(record.createdAt)}</td>
                    <td className="px-5 py-4">{record.patient?.fullName ?? '—'}</td>
                    <td className="px-5 py-4">{record.doctor?.fullName ?? '—'}</td>
                    <td className="px-5 py-4 text-muted-foreground line-clamp-1 max-w-xs">{record.chiefComplaint}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/medical-records/${record.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Evolução
                      </Link>
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
              <button 
                onClick={() => setPage((p) => p - 1)} 
                disabled={page === 1}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage((p) => p + 1)} 
                disabled={page === meta.totalPages}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
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
