
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseBateriaSelectionProps {
  modalityId: number;
  eventId: string | null;
  initialBateriaId?: number;
}

export function useBateriaSelection({
  modalityId,
  eventId,
  initialBateriaId
}: UseBateriaSelectionProps) {
  const [selectedBateriaId, setSelectedBateriaId] = useState<number | undefined>(initialBateriaId);
  const queryClient = useQueryClient();

  const createBateriaMutation = useMutation({
    mutationFn: async () => {
      if (!eventId || !modalityId) {
        throw new Error('Evento e modalidade são obrigatórios');
      }

      // Get the next bateria number
      const { data: existingBaterias, error: fetchError } = await supabase
        .from('baterias')
        .select('numero')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .order('numero', { ascending: false })
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      const nextNumber = existingBaterias && existingBaterias.length > 0 
        ? existingBaterias[0].numero + 1 
        : 1;

      // Create new bateria
      const { data, error } = await supabase
        .from('baterias')
        .insert({
          numero: nextNumber,
          modalidade_id: modalityId,
          evento_id: eventId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate bateria queries
      queryClient.invalidateQueries({ queryKey: ['baterias', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['bateria-statuses', modalityId, eventId] });
      
      // Select the newly created bateria
      setSelectedBateriaId(data.id);
      
      toast.success(`Bateria ${data.numero} criada com sucesso!`);
    },
    onError: (error) => {
      console.error('Error creating bateria:', error);
      toast.error('Erro ao criar bateria: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  });

  const handleBateriaSelect = useCallback((bateriaId: number | undefined) => {
    setSelectedBateriaId(bateriaId);
  }, []);

  const handleCreateBateria = useCallback(() => {
    createBateriaMutation.mutate();
  }, [createBateriaMutation]);

  return {
    selectedBateriaId,
    handleBateriaSelect,
    handleCreateBateria,
    isCreatingBateria: createBateriaMutation.isPending
  };
}
