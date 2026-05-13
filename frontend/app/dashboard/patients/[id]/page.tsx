'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { patientService } from '@/lib/services';
import {
  ArrowLeft, Phone, MapPin, AlertTriangle,
  Calendar, Shield, User, FileText, Receipt,
  Edit, HeartPulse,
} from 'lucide-react';
import Link from 'next/link';
import {
  cn, formatDate, formatAge, formatCPF, formatPhone,
  GENDER_LABELS, BLOOD_TYPE_LABELS, STATUS_LABELS,
  statusColor, formatTime,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types';

function Card({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/30">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn('text-sm mt-0.5', mono ? 'font-mono' : 'font-medium', !value && 'text-muted-foreground')}>
        {value || '—'}
      </p>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.get(id),
  });

  const { data: appointmentsResponse } = useQuery({
    queryKey: ['patient', id, 'appointments'],
    queryFn: () => patientService.getAppointments(id),
    enabled: !!patient,
  });

  const appointments = appointmentsResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Paciente não encontrado</p>
        <Link href="/dashboard/patients" className="text-primary text-sm mt-2 inline-block hover:underline">
          ← Voltar para pacientes
        </Link>
      </div>
    );
  }

  const addr = patient.address as any;
  const ec   = patient.emergencyContact as any;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-all hover:scale-105 active:scale-95"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-inner">
              {patient.fullName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">{patient.fullName}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <Badge variant="outline" className="font-mono text-[10px] tracking-wider px-2 py-0.5 bg-background">
                  {formatCPF(patient.cpf)}
                </Badge>
                {patient.bloodType && (
                  <span className="text-[10px] font-bold font-mono bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Tipo {BLOOD_TYPE_LABELS[patient.bloodType]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(patient.allergies.length > 0 || patient.chronicConditions.length > 0) && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Alertas Médicos
            </span>
          )}
          <Link
            href={`/dashboard/patients/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="bg-card/50 border border-border p-6 rounded-3xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Left col ─── */}
          <div className="lg:col-span-2 space-y-6">

            <Card title="Dados Pessoais" icon={User}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <InfoRow label="Nascimento" value={`${formatDate(patient.dateOfBirth)} · ${formatAge(patient.dateOfBirth)}`} />
                <InfoRow label="Sexo" value={GENDER_LABELS[patient.gender]} />
                <InfoRow label="Telefone" value={formatPhone(patient.phone)} mono />
                {patient.phoneSecondary && <InfoRow label="Tel. Secundário" value={formatPhone(patient.phoneSecondary)} mono />}
                {patient.email && <InfoRow label="E-mail" value={patient.email} />}
              </div>
            </Card>

            {addr?.street && (
              <Card title="Endereço" icon={MapPin}>
                <p className="text-sm font-medium">
                  {addr.street}, {addr.number}
                  {addr.complement ? ` — ${addr.complement}` : ''}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {addr.city} — {addr.state} · {addr.zip}
                </p>
              </Card>
            )}

            {(patient.allergies.length > 0 || patient.chronicConditions.length > 0) && (
              <Card title="Alertas de Saúde" icon={HeartPulse}>
                {patient.allergies.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Alergias</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((a) => (
                        <span key={a} className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {patient.chronicConditions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Condições Crônicas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.chronicConditions.map((c) => (
                        <span key={c} className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Appointment history */}
            <Card title="Histórico de Consultas" icon={Calendar}>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Nenhuma consulta registrada</p>
              ) : (
                <div className="space-y-2">
                  {appointments.slice(0, 6).map((apt: Appointment) => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="text-center min-w-[44px]">
                        <p className="text-xs font-bold text-foreground">{formatDate(apt.scheduledAt, 'dd/MM')}</p>
                        <p className="text-[10px] text-muted-foreground">{formatTime(apt.scheduledAt)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{apt.doctor?.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{apt.specialty?.name ?? apt.type}</p>
                      </div>
                      <Badge className={statusColor(apt.status)}>{STATUS_LABELS[apt.status]}</Badge>
                    </div>
                  ))}
                  {appointments.length > 6 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{appointments.length - 6} consultas anteriores
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* ─── Right col ─── */}
          <div className="space-y-6">

            <Card title="Convênio" icon={Shield}>
              {patient.insurance ? (
                <div>
                  <p className="font-semibold text-foreground">{patient.insurance.name}</p>
                  {patient.insuranceNumber && (
                    <p className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg mt-2">
                      Carteirinha: {patient.insuranceNumber}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Particular</p>
              )}
            </Card>

            {ec?.name && (
              <Card title="Contato de Emergência" icon={Phone}>
                <p className="font-medium text-sm">{ec.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ec.relationship}</p>
                <p className="text-sm font-mono mt-2">{formatPhone(ec.phone)}</p>
              </Card>
            )}

            {patient.notes && (
              <Card title="Observações" icon={FileText}>
                <p className="text-sm text-muted-foreground leading-relaxed">{patient.notes}</p>
              </Card>
            )}

            {/* Quick actions */}
            <div className="bg-muted/30 border border-border rounded-xl p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Ações Rápidas</p>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/appointments/new?patientId=${patient.id}`}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-all shadow-sm shadow-primary/20"
                >
                  <Calendar className="w-4 h-4" />
                  Novo Agendamento
                </Link>
                <Link
                  href={`/dashboard/medical-records?patientId=${patient.id}`}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-background border border-border hover:bg-muted text-foreground text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Ver Prontuários
                </Link>
                <Link
                  href={`/dashboard/billing?patientId=${patient.id}`}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-background border border-border hover:bg-muted text-foreground text-sm font-medium transition-colors"
                >
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  Ver Faturas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
