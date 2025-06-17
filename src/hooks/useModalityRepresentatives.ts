
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
      console.log('=== STARTING SET REPRESENTATIVE MUTATION ===');
      console.log('Mutation parameters:', { filialId, modalityId, atletaId });
      
      if (!filialId) {
        console.error('filialId is required but not provided');
        throw new Error('filialId é obrigatório');
      }
      
      console.log('Calling setModalityRepresentative API...');
      const result = await setModalityRepresentative(filialId, modalityId, atletaId);
      console.log('setModalityRepresentative API result:', result);
      
      console.log('=== SET REPRESENTATIVE MUTATION COMPLETED ===');
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('=== SET REPRESENTATIVE MUTATION SUCCESS ===');
      console.log('Success data:', data);
      console.log('Variables:', variables);
      
      // Invalidate and refetch queries
      console.log('Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['modalities-representatives', filialId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['registered-athletes'] });
      
      toast.success('Representante definido com sucesso!');
      console.log('=== SUCCESS HANDLING COMPLETED ===');
    },
    onError: (error: any) => {
      console.error('=== SET REPRESENTATIVE MUTATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      const errorMessage = error.message || 'Erro desconhecido ao definir representante';
      toast.error(`Erro ao definir representante: ${errorMessage}`);
      
      console.log('=== ERROR HANDLING COMPLETED ===');
    },
  });

  const removeRepresentative = useMutation({
    mutationFn: async (modalityId: number) => {
      console.log('=== STARTING REMOVE REPRESENTATIVE MUTATION ===');
      console.log('Mutation parameters:', { filialId, modalityId });
      
      if (!filialId) {
        console.error('filialId is required but not provided');
        throw new Error('filialId é obrigatório');
      }
      
      console.log('Calling removeModalityRepresentative API...');
      const result = await removeModalityRepresentative(filialId, modalityId);
      console.log('removeModalityRepresentative API result:', result);
      
      console.log('=== REMOVE REPRESENTATIVE MUTATION COMPLETED ===');
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('=== REMOVE REPRESENTATIVE MUTATION SUCCESS ===');
      console.log('Success data:', data);
      console.log('Variables:', variables);
      
      // Invalidate and refetch queries
      console.log('Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['modalities-representatives', filialId, eventId] });
      
      toast.success('Representante removido com sucesso!');
      console.log('=== SUCCESS HANDLING COMPLETED ===');
    },
    onError: (error: any) => {
      console.error('=== REMOVE REPRESENTATIVE MUTATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      const errorMessage = error.message || 'Erro desconhecido ao remover representante';
      toast.error(`Erro ao remover representante: ${errorMessage}`);
      
      console.log('=== ERROR HANDLING COMPLETED ===');
    },
  });

  return {
    setRepresentative,
    removeRepresentative
  };
};
