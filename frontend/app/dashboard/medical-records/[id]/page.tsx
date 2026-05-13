'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { medicalRecordService } from '@/lib/services';
import { 
  ArrowLeft, User, Stethoscope, FileText, 
  Activity, Clipboard, Info, Calendar
} from 'lucide-react';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';

function InfoCard({ title, icon: Icon, children, color }: {
  title: string; icon: React.ElementType; children: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className={cn("flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/30", color)}>
        <Icon className="w-4 h-4" />
        <h3 className="text-xs font-black uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: record, isLoading } = useQuery({
    queryKey: ['medical-record', id],
    queryFn: () => medicalRecordService.get(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Prontuário não encontrado</p>
        <button onClick={() => router.back()} className="text-primary text-sm mt-2 hover:underline">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader
          title="Detalhes da Evolução"
          description={`Registro clínico de ${record.patient?.fullName}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <InfoCard title="Paciente" icon={User} color="text-blue-600 bg-blue-50/50">
            <p className="font-bold text-lg text-foreground">{record.patient?.fullName}</p>
            <p className="text-xs text-muted-foreground mt-1">ID: {record.patientId}</p>
          </InfoCard>

          <InfoCard title="Atendimento" icon={Calendar} color="text-purple-600 bg-purple-50/50">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Data e Hora</p>
                <p className="text-sm font-medium">{formatDate(record.createdAt)} às {formatTime(record.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Médico Responsável</p>
                <p className="text-sm font-medium">{record.doctor?.fullName}</p>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title="Queixa Principal" icon={Activity} color="text-red-600 bg-red-50/50">
            <p className="text-foreground leading-relaxed italic">"{record.chiefComplaint}"</p>
          </InfoCard>

          <InfoCard title="Anamnese" icon={FileText} color="text-amber-600 bg-amber-50/50">
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
              {record.anamnesis}
            </div>
          </InfoCard>

          {record.physicalExam && (
            <InfoCard title="Exame Físico" icon={Stethoscope} color="text-indigo-600 bg-indigo-50/50">
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {record.physicalExam}
              </div>
            </InfoCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Diagnóstico" icon={Info} color="text-emerald-600 bg-emerald-50/50">
              <p className="font-bold text-foreground">{record.diagnosis || '—'}</p>
              {record.cidCode && (
                <Badge variant="outline" className="mt-2 font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
                  CID: {record.cidCode}
                </Badge>
              )}
            </InfoCard>

            <InfoCard title="Conduta" icon={Clipboard} color="text-primary bg-primary/5">
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {record.conduct}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
