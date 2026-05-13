'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { medicalRecordService, appointmentService, patientService } from '@/lib/services';
import { 
  ArrowLeft, Save, Activity, FileText, 
  Stethoscope, Clipboard, Info, User
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MedicalRecordFormData {
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  anamnesis: string;
  physicalExam?: string;
  diagnosis?: string;
  cidCode?: string;
  conduct: string;
}

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const queryClient = useQueryClient();

  const { data: appointment, isLoading: loadingApt } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentId ? appointmentService.get(appointmentId) : null,
    enabled: !!appointmentId,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MedicalRecordFormData>();

  useEffect(() => {
    if (appointment?.medicalRecord) {
      toast.warning('Este agendamento já possui um prontuário registrado.');
      router.push(`/dashboard/medical-records/${appointment.medicalRecord.id}`);
    }
  }, [appointment, router]);

  useEffect(() => {
    if (appointment) {
      setValue('appointmentId', appointment.id);
      setValue('patientId', appointment.patientId);
      setValue('doctorId', appointment.doctorId);
    }
  }, [appointment, setValue]);

  const mutation = useMutation({
    mutationFn: (data: MedicalRecordFormData) => medicalRecordService.create(data),
    onSuccess: () => {
      toast.success('Prontuário salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      router.push('/dashboard/medical-records');
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar prontuário: ' + (error.response?.data?.message || error.message));
    }
  });

  const onSave = (data: MedicalRecordFormData) => {
    if (!data.patientId || !data.doctorId) {
      toast.error('Dados do paciente ou médico não carregados. Recarregue a página.');
      return;
    }

    mutation.mutate({
      ...data,
      appointmentId: data.appointmentId || undefined,
    } as MedicalRecordFormData);
  };

  if (loadingApt) return <div className="p-10 text-center text-muted-foreground">Carregando dados do agendamento...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground transition-all">
            <ArrowLeft size={20} />
          </button>
          <PageHeader 
            title="Nova Evolução Clínica" 
            description={appointment ? `Atendimento para ${appointment.patient?.fullName}` : 'Preenchimento de prontuário'} 
          />
        </div>
        <Button 
          onClick={handleSubmit(onSave)}
          disabled={mutation.isPending}
          className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4 mr-2" />
          {mutation.isPending ? 'Salvando...' : 'Finalizar e Salvar'}
        </Button>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Info Summary */}
        {appointment?.patient && (
          <div className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-primary/60">Paciente em Atendimento</p>
              <p className="text-lg font-black text-primary">{appointment.patient.fullName}</p>
            </div>
          </div>
        )}

        {/* Hidden Fields */}
        <input type="hidden" {...register('appointmentId')} />
        <input type="hidden" {...register('patientId')} />
        <input type="hidden" {...register('doctorId')} />

        {/* Chief Complaint */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground ml-1">
            <Activity size={14} className="text-red-500" />
            Queixa Principal <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('chiefComplaint', { required: 'Campo obrigatório' })}
            placeholder="Ex: Cefaleia intensa e febre há 3 dias..."
            className={cn(
              "w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm min-h-[80px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all",
              errors.chiefComplaint && "border-red-500 ring-red-500/10"
            )}
          />
          {errors.chiefComplaint && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.chiefComplaint.message}</p>}
        </div>

        {/* Anamnesis */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground ml-1">
            <FileText size={14} className="text-amber-500" />
            Anamnese / História Clínica <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('anamnesis', { required: 'Campo obrigatório' })}
            placeholder="Relato detalhado dos sintomas, histórico familiar, medicamentos em uso..."
            className={cn(
              "w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm min-h-[150px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all",
              errors.anamnesis && "border-red-500 ring-red-500/10"
            )}
          />
        </div>

        {/* Physical Exam */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground ml-1">
            <Stethoscope size={14} className="text-indigo-500" />
            Exame Físico
          </label>
          <textarea
            {...register('physicalExam')}
            placeholder="Sinais vitais, ausculta, palpação..."
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm min-h-[100px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Diagnosis */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground ml-1">
            <Info size={14} className="text-emerald-500" />
            Diagnóstico / Hipótese
          </label>
          <input
            {...register('diagnosis')}
            placeholder="Ex: Infecção das Vias Aéreas Superiores"
            className="w-full px-4 py-2 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* CID */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground ml-1">
            <Clipboard size={14} className="text-blue-500" />
            Código CID-10
          </label>
          <input
            {...register('cidCode')}
            placeholder="Ex: J00"
            className="w-full px-4 py-2 rounded-xl bg-card border border-border text-sm font-mono focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Conduct */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground ml-1">
            <Save size={14} className="text-primary" />
            Conduta e Orientações <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('conduct', { required: 'Campo obrigatório' })}
            placeholder="Prescrições, encaminhamentos, retorno em 7 dias..."
            className={cn(
              "w-full px-4 py-3 rounded-2xl bg-card border border-border text-sm min-h-[100px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all",
              errors.conduct && "border-red-500 ring-red-500/10"
            )}
          />
        </div>
      </form>
    </div>
  );
}
