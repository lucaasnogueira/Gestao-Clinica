'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  X, User, Phone, Award, 
  ChevronLeft, ChevronRight, Save, Loader2,
  Stethoscope, DollarSign, Clock, FileText
} from 'lucide-react';
import { doctorService, specialtyService } from '@/lib/services';
import { useCreateDoctor, useUpdateDoctor } from '@/hooks/useDoctors';
import { cn, stripMask } from '@/lib/utils';
import type { Doctor } from '@/types';
import { Button } from '@/components/ui/button';
import { MaskedInput } from '@/components/shared/masked-input';

const schema = z.object({
  fullName: z.string().min(3, 'Nome obrigatório (mín. 3 caracteres)'),
  crm: z.string().min(4, 'CRM inválido'),
  crmState: z.string().length(2, 'UF inválida'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  bio: z.string().optional(),
  consultDuration: z.coerce.number().min(5, 'Mínimo 5 min'),
  consultPrice: z.coerce.number().min(0, 'Preço inválido'),
  specialtyIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

interface InlineDoctorFormProps {
  onClose: () => void;
  editingItem?: Doctor | null;
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring/50 transition-all';

export function InlineDoctorForm({ onClose, editingItem }: InlineDoctorFormProps) {
  const [step, setStep] = useState(1);
  const { mutateAsync: createDoctor, isPending: isCreating } = useCreateDoctor();
  const { mutateAsync: updateDoctor, isPending: isUpdating } = useUpdateDoctor();
  const isPending = isCreating || isUpdating;

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: specialtyService.list,
  });

  const { register, handleSubmit, formState: { errors }, reset, trigger, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      consultDuration: 30,
      consultPrice: 0,
      specialtyIds: [],
    }
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        fullName: editingItem.fullName,
        crm: editingItem.crm,
        crmState: editingItem.crmState,
        phone: editingItem.phone,
        // @ts-ignore - userId.email usually provided by include in service
        email: editingItem.user?.email || '',
        bio: editingItem.bio || '',
        consultDuration: editingItem.consultDuration,
        consultPrice: Number(editingItem.consultPrice),
        specialtyIds: editingItem.specialties?.map(s => s.specialty.id) || [],
      });
    } else {
      reset();
    }
    setStep(1);
  }, [editingItem, reset]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ['fullName', 'crm', 'crmState', 'phone', 'email'];
    else if (step === 2) fieldsToValidate = ['consultDuration', 'consultPrice'];

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      toast.error('Por favor, preencha os campos obrigatórios.');
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => setStep(s => s - 1);

  const onFormSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        phone: stripMask(data.phone),
        crm: stripMask(data.crm),
      };

      if (editingItem) {
        await updateDoctor({ id: editingItem.id, data: payload });
        toast.success('Médico atualizado com sucesso!');
      } else {
        await createDoctor(payload);
        toast.success('Médico cadastrado com sucesso!');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao salvar médico');
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-xl border border-border animate-in slide-in-from-top duration-300 mb-6 overflow-hidden relative">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
        <X size={20} />
      </button>

      <div className="flex items-center mb-8 pb-4 border-b border-border">
        <div className="bg-blue-500/10 p-2.5 rounded-xl mr-4 text-blue-600">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {editingItem ? `Editar: ${editingItem.fullName}` : 'Novo Médico'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? 'Dados profissionais' : step === 2 ? 'Configurações de atendimento' : 'Especialidades'}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 px-4 relative max-w-md mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
        <div className={cn("absolute top-1/2 left-0 h-0.5 bg-blue-500 transition-all duration-500 -translate-y-1/2 z-0", 
          step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full")} 
        />
        
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
              step >= s ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-muted text-muted-foreground"
            )}>
              {s}
            </div>
          </div>
        ))}
      </div>

      <form id="doctor-form" className="space-y-6">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Nome Completo *</label>
              <input {...register('fullName')} className={inputClass} placeholder="Dr. Nome do Médico" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">CRM *</label>
              <input {...register('crm')} className={inputClass} placeholder="000000" />
              {errors.crm && <p className="text-red-500 text-xs mt-1">{errors.crm.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Estado (UF) *</label>
              <input {...register('crmState')} className={inputClass} placeholder="SP" maxLength={2} />
              {errors.crmState && <p className="text-red-500 text-xs mt-1">{errors.crmState.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Telefone *</label>
              <MaskedInput {...register('phone')} mask="phone" placeholder="(11) 99999-9999" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">E-mail</label>
              <input {...register('email')} className={inputClass} placeholder="medico@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Clock size={12} /> Duração da Consulta (min) *
                </label>
                <input type="number" {...register('consultDuration')} className={inputClass} />
                {errors.consultDuration && <p className="text-red-500 text-xs mt-1">{errors.consultDuration.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <DollarSign size={12} /> Valor da Consulta (R$) *
                </label>
                <input type="number" step="0.01" {...register('consultPrice')} className={inputClass} />
                {errors.consultPrice && <p className="text-red-500 text-xs mt-1">{errors.consultPrice.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <FileText size={12} /> Biografia / Especialidades
                </label>
                <textarea {...register('bio')} className={cn(inputClass, "h-24 resize-none")} placeholder="Breve descrição do profissional..." />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Selecione as Especialidades</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specialties.map((s) => {
                const selected = watch('specialtyIds')?.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      const current = watch('specialtyIds') || [];
                      const next = selected ? current.filter(id => id !== s.id) : [...current, s.id];
                      setValue('specialtyIds', next);
                    }}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-left transition-all",
                      selected 
                        ? "bg-blue-500/10 border-blue-500 text-blue-700 shadow-sm" 
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <p className="text-xs font-bold">{s.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>

      <div className="flex justify-between mt-10 pt-6 border-t border-border">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={step === 1 ? onClose : handlePrev}
          className="h-11 px-6 rounded-xl font-bold text-xs uppercase"
        >
          {step === 1 ? 'Cancelar' : <><ChevronLeft size={16} className="mr-1" /> Voltar</>}
        </Button>

        <div className="flex gap-3">
          {step < 3 ? (
            <Button 
              type="button" 
              onClick={handleNext}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold text-xs uppercase shadow-lg shadow-blue-600/10"
            >
              Próximo <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={() => handleSubmit(onFormSubmit)()}
              disabled={isPending}
              className="h-11 px-10 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold text-xs uppercase shadow-lg shadow-green-600/10"
            >
              {isPending ? (
                <><Loader2 size={18} className="animate-spin mr-2" /> Salvando...</>
              ) : (
                <><Save size={18} className="mr-2" /> {editingItem ? 'Salvar Alterações' : 'Finalizar Cadastro'}</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
