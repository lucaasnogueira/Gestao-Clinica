import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/lib/services';
import { toast } from 'sonner';

export function useDoctorList(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: () => doctorService.list(params),
  });
}

export function useDoctorDetail(id: string) {
  return useQuery({
    queryKey: ['doctors', id],
    queryFn: () => doctorService.get(id),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doctorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => doctorService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctors', id] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doctorService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Médico removido com sucesso');
    },
  });
}
