'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  X, User, Phone, MapPin, Activity, 
  ChevronLeft, ChevronRight, Save, Loader2,
  HeartPulse, Shield
} from 'lucide-react';
import { insuranceService, cepService } from '@/lib/services';
import { useCreatePatient, useUpdatePatient } from '@/hooks/usePatients';
import { cn, stripMask } from '@/lib/utils';
import type { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { MaskedInput } from '@/components/shared/masked-input';

const schema = z.object({
  fullName:   z.string().min(3, 'Nome obrigatório (mín. 3 caracteres)'),
  cpf:        z.string().min(11, 'CPF inválido'),
  dateOfBirth: z.string().min(1, 'Data de nascimento obrigatória'),
  gender:     z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], { required_error: 'Selecione o sexo' }),
  bloodType:  z.string().optional(),
  phone:      z.string().min(10, 'Telefone inválido'),
  phoneSecondary: z.string().optional(),
  email:      z.string().email('E-mail inválido').optional().or(z.literal('')),
  street: z.string().optional(), 
  addressNumber: z.string().optional(),
  complement: z.string().optional(), 
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(), 
  zip: z.string().optional(),
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

interface InlinePatientFormProps {
  onClose: () => void;
  editingItem?: Patient | null;
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring/50 transition-all';

export function InlinePatientForm({ onClose, editingItem }: InlinePatientFormProps) {
  const [step, setStep] = useState(1);
  const { mutateAsync: createPatient, isPending: isCreating } = useCreatePatient();
  const { mutateAsync: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const isPending = isCreating || isUpdating;

  const { data: insurances = [] } = useQuery({
    queryKey: ['insurances'],
    queryFn: insuranceService.list,
  });

  const { register, handleSubmit, formState: { errors }, reset, trigger, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: 'MALE',
    }
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        fullName: editingItem.fullName,
        cpf: editingItem.cpf,
        dateOfBirth: editingItem.dateOfBirth.split('T')[0],
        gender: editingItem.gender,
        bloodType: editingItem.bloodType || '',
        phone: editingItem.phone,
        phoneSecondary: editingItem.phoneSecondary || '',
        email: editingItem.email || '',
        street: editingItem.address?.street || '',
        addressNumber: editingItem.address?.number || '',
        complement: editingItem.address?.complement || '',
        city: editingItem.address?.city || '',
        state: editingItem.address?.state || '',
        neighborhood: editingItem.address?.neighborhood || '',
        zip: editingItem.address?.zip || '',
        allergies: editingItem.allergies.join(','),
        chronicConditions: editingItem.chronicConditions.join(','),
        notes: editingItem.notes || '',
        insuranceId: editingItem.insuranceId || '',
        insuranceNumber: editingItem.insuranceNumber || '',
        emergencyContactName: editingItem.emergencyContact?.name || '',
        emergencyContactPhone: editingItem.emergencyContact?.phone || '',
        emergencyContactRelationship: editingItem.emergencyContact?.relationship || '',
      });
      setStep(1);
    } else {
      reset();
      setStep(1);
    }
  }, [editingItem, reset]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'cpf', 'dateOfBirth', 'gender'];
    } else if (step === 2) {
      fieldsToValidate = ['phone', 'email', 'street', 'addressNumber', 'city', 'state', 'zip', 'neighborhood'];
    }

    const isValid = await trigger(fieldsToValidate);
    
    if (!isValid) {
      console.warn('Validação falhou para os campos:', fieldsToValidate);
      toast.error('Por favor, verifique os campos obrigatórios antes de prosseguir.');
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => setStep(s => s - 1);

  const onFormSubmit = async (data: FormData) => {
    if (step < 3) return;

    try {
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
        allergies:          data.allergies ? data.allergies.split(',').filter(Boolean) : [],
        chronicConditions:  data.chronicConditions ? data.chronicConditions.split(',').filter(Boolean) : [],
      };

      if (data.street) {
        payload.address = {
          street: data.street, number: data.addressNumber,
          complement: data.complement, city: data.city,
          state: data.state, zip: stripMask(data.zip || ''),
          neighborhood: data.neighborhood,
        };
      }

      if (data.emergencyContactName) {
        payload.emergencyContact = {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone ? stripMask(data.emergencyContactPhone) : undefined,
          relationship: data.emergencyContactRelationship,
        };
      }

      if (editingItem) {
        await updatePatient({ id: editingItem.id, data: payload });
        toast.success('Paciente atualizado com sucesso!');
      } else {
        await createPatient(payload);
        toast.success('Paciente cadastrado com sucesso!');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao salvar paciente');
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = stripMask(e.target.value);
    if (cep.length !== 8) return;

    try {
      setIsFetchingCep(true);
      const data = await cepService.fetch(cep);
      
      if (data.street) setValue('street', data.street, { shouldValidate: true });
      if (data.neighborhood) setValue('neighborhood', data.neighborhood, { shouldValidate: true });
      if (data.city) setValue('city', data.city, { shouldValidate: true });
      if (data.state) setValue('state', data.state, { shouldValidate: true });
      if (data.complement) setValue('complement', data.complement, { shouldValidate: true });
      
      toast.success('Endereço preenchido automaticamente!');
    } catch (err: any) {
      console.error('Erro ao buscar CEP:', err);
      const msg = err.response?.data?.message || 'CEP não encontrado ou erro na busca';
      toast.error(msg);
    } finally {
      setIsFetchingCep(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-xl border border-border animate-in slide-in-from-top duration-300 mb-6 overflow-hidden relative">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
      >
        <X size={20} />
      </button>

      <div className="flex items-center mb-8 pb-4 border-b border-border">
        <div className="bg-primary/10 p-2.5 rounded-xl mr-4 text-primary">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {editingItem ? `Editar: ${editingItem.fullName}` : 'Novo Paciente'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? 'Dados principais e identificação' : step === 2 ? 'Informações de contato e localização' : 'Saúde, convênio e emergência'}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
        <div className={cn("absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -translate-y-1/2 z-0", 
          step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full")} 
        />
        
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
              step >= s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "bg-muted text-muted-foreground"
            )}>
              {s}
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-wider font-bold mt-2",
              step >= s ? "text-primary" : "text-muted-foreground"
            )}>
              {s === 1 ? 'Identificação' : s === 2 ? 'Contato' : 'Saúde'}
            </span>
          </div>
        ))}
      </div>

      <form 
        id="patient-form"
        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        className="space-y-6"
      >
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-foreground/80 mb-1.5">Nome Completo *</label>
              <input id="fullName" {...register('fullName')} className={inputClass} placeholder="Nome completo do paciente" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-semibold text-foreground/80 mb-1.5">CPF *</label>
              <MaskedInput id="cpf" {...register('cpf')} mask="cpf" placeholder="000.000.000-00" />
              {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-1.5">Data de Nascimento *</label>
              <input id="dateOfBirth" {...register('dateOfBirth')} type="date" className={inputClass} />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-1.5">Sexo *</label>
              <select id="gender" {...register('gender')} className={inputClass}>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Feminino</option>
                <option value="OTHER">Outro</option>
                <option value="PREFER_NOT_TO_SAY">Prefiro não informar</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo Sanguíneo</label>
              <select {...register('bloodType')} className={inputClass}>
                <option value="">Não informado</option>
                {['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','O_POSITIVE','O_NEGATIVE','AB_POSITIVE','AB_NEGATIVE']
                  .map((bt) => (
                    <option key={bt} value={bt}>
                      {bt.replace('_POSITIVE','+').replace('_NEGATIVE','-').replace('AB','AB').replace(/^([ABO])_/,'$1')}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground/80 mb-1.5">Telefone Principal *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <MaskedInput id="phone" {...register('phone')} mask="phone" className="pl-10" placeholder="(11) 99999-9999" />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Telefone Secundário</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <MaskedInput {...register('phoneSecondary')} mask="phone" className="pl-10" placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
                <input id="email" {...register('email')} type="email" className={inputClass} placeholder="paciente@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-primary" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rua / Logradouro</label>
                  <input {...register('street')} className={inputClass} placeholder="Rua das Flores" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número</label>
                  <input {...register('addressNumber')} className={inputClass} placeholder="123" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Complemento</label>
                  <input {...register('complement')} className={inputClass} placeholder="Apto 101, Bloco A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade</label>
                  <input {...register('city')} className={inputClass} placeholder="São Paulo" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bairro</label>
                  <input {...register('neighborhood')} className={inputClass} placeholder="Centro" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado</label>
                  <input {...register('state')} className={inputClass} placeholder="SP" maxLength={2} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">CEP</label>
                  <div className="relative">
                    <MaskedInput 
                      {...register('zip')} 
                      mask="cep"
                      className={cn(inputClass, "pr-10")} 
                      placeholder="00000-000"
                      onBlur={handleCepBlur}
                    />
                    {isFetchingCep && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Activity size={14} className="text-red-500" /> Alergias
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Dipirona', 'Penicilina', 'Iodo', 'Lactose', 'Glúten', 'Frutos do Mar'].map(item => {
                    const current = watch('allergies') || '';
                    const list = current.split(',').filter(Boolean);
                    const active = list.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          const newList = active ? list.filter(l => l !== item) : [...list, item];
                          setValue('allergies', newList.join(','), { shouldDirty: true });
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border",
                          active 
                            ? "bg-red-500/10 border-red-500 text-red-600 shadow-sm" 
                            : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <input {...register('allergies')} className={inputClass} placeholder="Outras alergias separadas por vírgula" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <HeartPulse size={14} className="text-amber-500" /> Condições Crônicas
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Hipertensão', 'Diabetes', 'Asma', 'Hipotireoidismo', 'Anemia', 'Rinite'].map(item => {
                    const current = watch('chronicConditions') || '';
                    const list = current.split(',').filter(Boolean);
                    const active = list.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          const newList = active ? list.filter(l => l !== item) : [...list, item];
                          setValue('chronicConditions', newList.join(','), { shouldDirty: true });
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border",
                          active 
                            ? "bg-amber-500/10 border-amber-500 text-amber-600 shadow-sm" 
                            : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <input {...register('chronicConditions')} className={inputClass} placeholder="Outras condições separadas por vírgula" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-blue-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Convênio</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Operadora</label>
                  <select {...register('insuranceId')} className={inputClass}>
                    <option value="">Particular (sem convênio)</option>
                    {insurances.map((ins: any) => (
                      <option key={ins.id} value={ins.id}>{ins.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número da Carteirinha</label>
                  <input {...register('insuranceNumber')} className={inputClass} placeholder="0000000000" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-orange-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contato de Emergência</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome</label>
                  <input {...register('emergencyContactName')} className={inputClass} placeholder="Nome do contato" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone</label>
                  <MaskedInput {...register('emergencyContactPhone')} mask="phone" className={inputClass} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parentesco</label>
                  <input {...register('emergencyContactRelationship')} className={inputClass} placeholder="Ex: Filho, Cônjuge" />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="flex justify-between mt-10 pt-6 border-t border-border">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={step === 1 ? onClose : handlePrev}
          className="h-11 px-6 rounded-xl text-muted-foreground hover:text-foreground font-bold text-xs uppercase"
        >
          {step === 1 ? 'Cancelar' : <><ChevronLeft size={16} className="mr-1" /> Voltar</>}
        </Button>

        <div className="flex gap-3">
          {step < 3 ? (
            <Button 
              type="button" 
              onClick={handleNext}
              className="h-11 px-8 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground font-bold text-xs uppercase shadow-lg shadow-primary/10"
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
