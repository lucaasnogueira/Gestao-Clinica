import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/lib/services';
import type { Patient, CreatePatientDTO } from '@/types';

export const PATIENT_KEYS = {
  all: ['patients'] as const,
  list: (params: any) => [...PATIENT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...PATIENT_KEYS.all, 'detail', id] as const,
};

export function usePatientList(params: any) {
  return useQuery({
    queryKey: PATIENT_KEYS.list(params),
    queryFn: () => patientService.list(params),
  });
}

export function usePatientDetail(id: string) {
  return useQuery({
    queryKey: PATIENT_KEYS.detail(id),
    queryFn: () => patientService.get(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientDTO) => patientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePatientDTO> }) =>
      patientService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.detail(id) });
    },
  });
}

export function useRemovePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
    },
  });
}
