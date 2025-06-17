
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchModalitiesWithRepresentatives,
  fetchRegisteredAthletesForModality,
  setModalityRepresentative,
  removeModalityRepresentative
} from '@/lib/api/representatives';

export const useModalitiesWithRepresentatives = (filialId: string | undefined, eventId: string | null) => {
  console.log('useModalitiesWithRepresentatives called with:', { filialId, eventId });
  
  return useQuery({
    queryKey: ['modalities-representatives', filialId, eventId],
    queryFn: async () => {
      console.log('Fetching modalities with representatives...');
      if (!filialId || !eventId) {
        throw new Error('filialId and eventId are required');
      }
      const result = await fetchModalitiesWithRepresentatives(filialId, eventId);
      console.log('Modalities with representatives result:', result);
      return result;
    },
    enabled: !!filialId && !!eventId,
    retry: (failureCount, error) => {
      console.error('Query failed:', error);
      return failureCount < 2;
    }
  });
};

export const useRegisteredAthletes = (filialId: string | undefined, modalityId: number | null, eventId: string | null) => {
  console.log('useRegisteredAthletes called with:', { filialId, modalityId, eventId });
  
  return useQuery({
    queryKey: ['registered-athletes', filialId, modalityId, eventId],
    queryFn: async () => {
      console.log('Fetching registered athletes...');
      if (!filialId || !modalityId || !eventId) {
        throw new Error('filialId, modalityId and eventId are required');
      }
      const result = await fetchRegisteredAthletesForModality(filialId, modalityId, eventId);
      console.log('Registered athletes result:', result);
      return result;
    },
    enabled: !!filialId && !!modalityId && !!eventId,
    retry: (failureCount, error) => {
      console.error('Athletes query failed:', error);
      return failureCount < 2;
    }
  });
};

export const useRepresentativeMutations = (filialId: string | undefined, eventId: string | null) => {
  const queryClient = useQueryClient();

  const setRepresentative = useMutation({
    mutationFn: async ({ modalityId, atletaId }: { modalityId: number; atletaId: string }) => {
      console.log('Setting representative mutation:', { filialId, modalityId, atletaId });
      if (!filialId) {
        throw new Error('filialId is required');
      }
      console.log('Calling setModalityRepresentative API...');
      const result = await setModalityRepresentative(filialId, modalityId, atletaId);
      console.log('setModalityRepresentative result:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('Representative set successfully, invalidating queries...', { data, variables });
      queryClient.invalidateQueries({ queryKey: ['modalities-representatives', filialId, eventId] });
      toast.success('Representante definido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error setting representative:', error);
      toast.error('Erro ao definir representante: ' + (error.message || 'Erro desconhecido'));
    },
  });

  const removeRepresentative = useMutation({
    mutationFn: async (modalityId: number) => {
      console.log('Removing representative mutation:', { filialId, modalityId });
      if (!filialId) {
        throw new Error('filialId is required');
      }
      console.log('Calling removeModalityRepresentative API...');
      const result = await removeModalityRepresentative(filialId, modalityId);
      console.log('removeModalityRepresentative result:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('Representative removed successfully, invalidating queries...', { data, variables });
      queryClient.invalidateQueries({ queryKey: ['modalities-representatives', filialId, eventId] });
      toast.success('Representante removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error removing representative:', error);
      toast.error('Erro ao remover representante: ' + (error.message || 'Erro desconhecido'));
    },
  });

  return {
    setRepresentative,
    removeRepresentative
  };
};
