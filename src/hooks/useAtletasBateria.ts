
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AtletaBateria {
  id: string;
  atleta_id: string;
  numero_bateria: number;
  modalidade_id: number;
  evento_id: string;
  created_at?: string;
}

export function useAtletasBateria(modalityId: number, eventId: string, bateriaId?: number) {
  const queryClient = useQueryClient();

  // Fetch athletes in a specific bateria
  const { data: atletasBateria = [], isLoading } = useQuery({
    queryKey: ['atletas-bateria', modalityId, eventId, bateriaId],
    queryFn: async () => {
      if (!bateriaId) return [];

      const { data, error } = await supabase
        .from('atletas_bateria')
        .select('*')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('numero_bateria', bateriaId);

      if (error) throw error;
      return data as AtletaBateria[];
    },
    enabled: !!bateriaId && !!modalityId && !!eventId,
  });

  // Add athlete to bateria
  const addAthleteToBateria = useMutation({
    mutationFn: async ({ athleteId, bateriaId }: { athleteId: string; bateriaId: number }) => {
      const { data, error } = await supabase
        .from('atletas_bateria')
        .insert({
          atleta_id: athleteId,
          numero_bateria: bateriaId,
          modalidade_id: modalityId,
          evento_id: eventId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atletas-bateria'] });
      toast.success('Atleta adicionado à bateria com sucesso!');
    },
    onError: (error) => {
      console.error('Error adding athlete to bateria:', error);
      toast.error('Erro ao adicionar atleta à bateria');
    }
  });

  // Remove athlete from bateria
  const removeAthleteFromBateria = useMutation({
    mutationFn: async ({ athleteId, bateriaId }: { athleteId: string; bateriaId: number }) => {
      const { error } = await supabase
        .from('atletas_bateria')
        .delete()
        .eq('atleta_id', athleteId)
        .eq('numero_bateria', bateriaId)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atletas-bateria'] });
      toast.success('Atleta removido da bateria com sucesso!');
    },
    onError: (error) => {
      console.error('Error removing athlete from bateria:', error);
      toast.error('Erro ao remover atleta da bateria');
    }
  });

  // Update multiple athletes in bateria
  const updateBateriaAthletes = useMutation({
    mutationFn: async ({ athleteIds, bateriaId }: { athleteIds: string[]; bateriaId: number }) => {
      // First, remove all existing athletes from this bateria
      const { error: deleteError } = await supabase
        .from('atletas_bateria')
        .delete()
        .eq('numero_bateria', bateriaId)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);

      if (deleteError) throw deleteError;

      // Then, add the new athletes
      if (athleteIds.length > 0) {
        const insertData = athleteIds.map(athleteId => ({
          atleta_id: athleteId,
          numero_bateria: bateriaId,
          modalidade_id: modalityId,
          evento_id: eventId
        }));

        const { error: insertError } = await supabase
          .from('atletas_bateria')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      return athleteIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atletas-bateria'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias'] });
      toast.success('Participantes da bateria atualizados com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating bateria athletes:', error);
      toast.error('Erro ao atualizar participantes da bateria');
    }
  });

  return {
    atletasBateria,
    isLoading,
    addAthleteToBateria,
    removeAthleteFromBateria,
    updateBateriaAthletes
  };
}
