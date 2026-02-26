'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { patientService, insuranceService } from '@/lib/services';
import { cn, stripMask } from '@/lib/utils';

const schema = z.object({
  fullName:   z.string().min(3, 'Nome obrigatório (mín. 3 caracteres)'),
  cpf:        z.string().min(11, 'CPF inválido'),
  dateOfBirth: z.string().min(1, 'Data de nascimento obrigatória'),
  gender:     z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], { required_error: 'Selecione o sexo' }),
  bloodType:  z.string().optional(),
  phone:      z.string().min(10, 'Telefone inválido'),
  phoneSecondary: z.string().optional(),
  email:      z.string().email('E-mail inválido').optional().or(z.literal('')),
  street: z.string().optional(), addressNumber: z.string().optional(),
  complement: z.string().optional(), city: z.string().optional(),
  state: z.string().optional(), zip: z.string().optional(),
  allergies:  z.string().optional(),
  chronicConditions: z.string().optional(),
  notes:      z.string().optional(),
  insuranceId: z.string().optional(),
  insuranceNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
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

export default function NewPatientPage() {
  const router = useRouter();

  const { data: insurances = [] } = useQuery({
    queryKey: ['insurances'],
    queryFn: insuranceService.list,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: any = {
        fullName:    data.fullName,
        cpf:         stripMask(data.cpf),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : '',
        gender:      data.gender,
        bloodType:   data.bloodType || undefined,
        phone:       stripMask(data.phone),
        phoneSecondary: data.phoneSecondary ? stripMask(data.phoneSecondary) : undefined,
        email:       data.email || undefined,
        notes:       data.notes || undefined,
        insuranceId: data.insuranceId || undefined,
        insuranceNumber: data.insuranceNumber || undefined,
        allergies:          data.allergies ? data.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        chronicConditions:  data.chronicConditions ? data.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (data.street) {
        payload.address = {
          street: data.street, number: data.addressNumber,
          complement: data.complement, city: data.city,
          state: data.state, zip: data.zip,
        };
      }
      if (data.emergencyContactName) {
        payload.emergencyContact = {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship,
        };
      }
      return patientService.create(payload);
    },
    onSuccess: () => {
      toast.success('Paciente cadastrado com sucesso!');
      router.push('/dashboard/patients');
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Erro ao cadastrar paciente'),
  });

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Paciente</h1>
          <p className="text-muted-foreground text-sm">Preencha os dados para cadastrar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">

        <Section title="Dados Pessoais">
          <Field label="Nome Completo" required error={errors.fullName?.message} full>
            <input {...register('fullName')} className={input} placeholder="Nome completo do paciente" />
          </Field>
          <Field label="CPF" required error={errors.cpf?.message}>
            <input {...register('cpf')} className={input} placeholder="000.000.000-00" />
          </Field>
          <Field label="Data de Nascimento" required error={errors.dateOfBirth?.message}>
            <input {...register('dateOfBirth')} type="date" className={input} />
          </Field>
          <Field label="Sexo" required error={errors.gender?.message}>
            <select {...register('gender')} className={input}>
              <option value="">Selecione...</option>
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Feminino</option>
              <option value="OTHER">Outro</option>
              <option value="PREFER_NOT_TO_SAY">Prefiro não informar</option>
            </select>
          </Field>
          <Field label="Tipo Sanguíneo">
            <select {...register('bloodType')} className={input}>
              <option value="">Não informado</option>
              {['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','O_POSITIVE','O_NEGATIVE','AB_POSITIVE','AB_NEGATIVE']
                .map((bt) => (
                  <option key={bt} value={bt}>
                    {bt.replace('_POSITIVE','+').replace('_NEGATIVE','-').replace('AB','AB').replace(/^([ABO])_/,'$1')}
                  </option>
                ))}
            </select>
          </Field>
        </Section>

        <Section title="Contato">
          <Field label="Telefone Principal" required error={errors.phone?.message}>
            <input {...register('phone')} className={input} placeholder="(11) 99999-9999" />
          </Field>
          <Field label="Telefone Secundário">
            <input {...register('phoneSecondary')} className={input} placeholder="(11) 99999-9999" />
          </Field>
          <Field label="E-mail" error={errors.email?.message} full>
            <input {...register('email')} type="email" className={input} placeholder="paciente@email.com" />
          </Field>
        </Section>

        <Section title="Endereço">
          <Field label="Rua / Logradouro" full>
            <input {...register('street')} className={input} placeholder="Rua das Flores" />
          </Field>
          <Field label="Número"><input {...register('addressNumber')} className={input} placeholder="123" /></Field>
          <Field label="Complemento"><input {...register('complement')} className={input} placeholder="Apto 4B" /></Field>
          <Field label="Cidade"><input {...register('city')} className={input} placeholder="São Paulo" /></Field>
          <Field label="Estado"><input {...register('state')} className={input} placeholder="SP" maxLength={2} /></Field>
          <Field label="CEP"><input {...register('zip')} className={input} placeholder="00000-000" /></Field>
        </Section>

        <Section title="Informações de Saúde">
          <Field label="Alergias (separar por vírgula)" full>
            <input {...register('allergies')} className={input} placeholder="Dipirona, Penicilina..." />
          </Field>
          <Field label="Condições Crônicas (separar por vírgula)" full>
            <input {...register('chronicConditions')} className={input} placeholder="Hipertensão, Diabetes..." />
          </Field>
          <Field label="Observações gerais" full>
            <textarea {...register('notes')} rows={3} className={input + ' resize-none'} placeholder="Observações..." />
          </Field>
        </Section>

        <Section title="Convênio">
          <Field label="Operadora">
            <select {...register('insuranceId')} className={input}>
              <option value="">Particular (sem convênio)</option>
              {insurances.map((ins: any) => (
                <option key={ins.id} value={ins.id}>{ins.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Número da Carteirinha">
            <input {...register('insuranceNumber')} className={input} placeholder="0000000000" />
          </Field>
        </Section>

        <Section title="Contato de Emergência">
          <Field label="Nome do Contato">
            <input {...register('emergencyContactName')} className={input} placeholder="Nome completo" />
          </Field>
          <Field label="Telefone">
            <input {...register('emergencyContactPhone')} className={input} placeholder="(11) 99999-9999" />
          </Field>
          <Field label="Parentesco">
            <input {...register('emergencyContactRelationship')} className={input} placeholder="Ex: Cônjuge, Filho(a)" />
          </Field>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link
            href="/dashboard/patients"
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
              : <><Save className="w-4 h-4" /> Cadastrar Paciente</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
