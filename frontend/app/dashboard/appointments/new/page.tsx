'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Search } from 'lucide-react';
import Link from 'next/link';
import { appointmentService, patientService, doctorService, specialtyService, insuranceService } from '@/lib/services';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const schema = z.object({
  patientId:   z.string().min(1, 'Selecione o paciente'),
  doctorId:    z.string().min(1, 'Selecione o médico'),
  specialtyId: z.string().optional(),
  scheduledAt: z.string().min(1, 'Data e hora obrigatórias'),
  type:        z.string().min(1, 'Tipo de consulta obrigatório'),
  notes:       z.string().optional(),
  insuranceId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const input = 'w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring/50 transition-all';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-3.5 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Field({ label, required, error, full, children }: {
  label: string; required?: boolean; error?: string; full?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(full && 'md:col-span-2')}>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'search', searchPatient],
    queryFn: () => searchPatient.length >= 3 ? patientService.search(searchPatient) : Promise.resolve([]),
    enabled: searchPatient.length >= 3 && showPatientResults,
  });

  const { data: doctorRes } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.list,
  });
  const doctors = doctorRes?.data ?? [];

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtyService.list,
  });

  const { data: insurances = [] } = useQuery({
    queryKey: ['insurances'],
    queryFn: insuranceService.list,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'CONSULTA',
    }
  });

  const selectedPatientId = watch('patientId');

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      // API expects scheduledAt as ISO string. The input type="datetime-local" gives "YYYY-MM-DDTHH:mm"
      const startDate = new Date(data.scheduledAt);
      if (isNaN(startDate.getTime())) {
        throw new Error('Data ou hora inválida');
      }

      // Get doctor's consult duration or default to 30 mins
      const selectedDoctor = doctors.find((d: any) => d.id === data.doctorId);
      const duration = selectedDoctor?.consultDuration || 30;
      const endDate = new Date(startDate.getTime() + duration * 60000);

      const payload = {
        patientId: data.patientId,
        doctorId: data.doctorId,
        specialtyId: data.specialtyId || undefined,
        insuranceId: data.insuranceId || undefined,
        type: data.type,
        notes: data.notes || undefined,
        scheduledAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
      };

      return appointmentService.create(payload as any);
    },
    onSuccess: () => {
      toast.success('Agendamento realizado com sucesso!');
      router.push('/dashboard/appointments');
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Erro ao realizar agendamento'),
  });

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/appointments" className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Agendamento</h1>
          <p className="text-muted-foreground text-sm">Preencha os dados para agendar a consulta</p>
        </div>
      </div>

      <form 
        onSubmit={handleSubmit(
          (d) => {
            console.log('Form data:', d);
            mutation.mutate(d);
          },
          (err) => {
            console.error('Validation errors:', err);
            toast.error('Verifique os campos obrigatórios');
          }
        )} 
        className="space-y-5"
      >
        <Section title="Dados da Consulta">
          <Field label="Paciente" required error={errors.patientId?.message} full>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className={cn(input, "pl-10")}
                placeholder="Buscar paciente por nome ou CPF (mín. 3 caracteres)..."
                value={searchPatient}
                onChange={(e) => {
                  setSearchPatient(e.target.value);
                  setShowPatientResults(true);
                }}
                onFocus={() => setShowPatientResults(true)}
              />
              {showPatientResults && patients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors",
                        selectedPatientId === p.id && "bg-primary/10 text-primary font-medium"
                      )}
                      onClick={() => {
                        setValue('patientId', p.id, { shouldValidate: true });
                        setSearchPatient(p.fullName);
                        setShowPatientResults(false);
                      }}
                    >
                      <div className="font-medium">{p.fullName}</div>
                      <div className="text-xs text-muted-foreground">CPF: {p.cpf}</div>
                    </button>
                  ))}
                </div>
              )}
              <input type="hidden" value={selectedPatientId || ''} {...register('patientId')} />
            </div>
          </Field>

          <Field label="Médico" required error={errors.doctorId?.message}>
            <select {...register('doctorId')} className={input}>
              <option value="">Selecione o médico...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.fullName}</option>
              ))}
            </select>
          </Field>

          <Field label="Especialidade" error={errors.specialtyId?.message}>
            <select {...register('specialtyId')} className={input}>
              <option value="">Selecione a especialidade...</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Data e Hora" required error={errors.scheduledAt?.message}>
            <input {...register('scheduledAt')} type="datetime-local" className={input} />
          </Field>

          <Field label="Tipo de Consulta" required error={errors.type?.message}>
            <select {...register('type')} className={input}>
              <option value="CONSULTA">Consulta</option>
              <option value="RETORNO">Retorno</option>
              <option value="EXAME">Exame</option>
              <option value="TELEMEDICINA">Telemedicina</option>
            </select>
          </Field>

          <Field label="Convênio" error={errors.insuranceId?.message}>
            <select {...register('insuranceId')} className={input}>
              <option value="">Particular (sem convênio)</option>
              {insurances.map((ins) => (
                <option key={ins.id} value={ins.id}>{ins.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Observações" error={errors.notes?.message} full>
            <textarea {...register('notes')} rows={3} className={cn(input, 'resize-none')} placeholder="Observações adicionais..." />
          </Field>
        </Section>

        <div className="flex items-center justify-end gap-3 pb-6">
          <Link
            href="/dashboard/appointments"
            className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted text-sm font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {mutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              : <><Save className="w-4 h-4" /> Realizar Agendamento</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
