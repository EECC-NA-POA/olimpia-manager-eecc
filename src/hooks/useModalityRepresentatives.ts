
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchModalitiesWithRepresentatives,
  fetchRegisteredAthletesForModality,
  setModalityRepresentative,
  removeModalityRepresentative
} from '@/lib/api/representatives';

export const useModalitiesWithRepresentatives = (filialId: string | undefined, eventId: string | null) => {
  return useQuery({
    queryKey: ['modalities-representatives', filialId, eventId],
    queryFn: () => fetchModalitiesWithRepresentatives(filialId!, eventId!),
    enabled: !!filialId && !!eventId,
  });
};

export const useRegisteredAthletes = (filialId: string | undefined, modalityId: number | null, eventId: string | null) => {
  return useQuery({
    queryKey: ['registered-athletes', filialId, modalityId, eventId],
    queryFn: () => fetchRegisteredAthletesForModality(filialId!, modalityId!, eventId!),
    enabled: !!filialId && !!modalityId && !!eventId,
  });
};

export const useRepresentativeMutations = (filialId: string | undefined, eventId: string | null) => {
  const queryClient = useQueryClient();

  const setRepresentative = useMutation({
    mutationFn: ({ modalityId, atletaId }: { modalityId: number; atletaId: string }) =>
      setModalityRepresentative(filialId!, modalityId, atletaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalities-representatives', filialId, eventId] });
      toast.success('Representante definido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error setting representative:', error);
      toast.error('Erro ao definir representante');
    },
  });

  const removeRepresentative = useMutation({
    mutationFn: (modalityId: number) => removeModalityRepresentative(filialId!, modalityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalities-representatives', filialId, eventId] });
      toast.success('Representante removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error removing representative:', error);
      toast.error('Erro ao remover representante');
    },
  });

  return {
    setRepresentative,
    removeRepresentative
  };
};
