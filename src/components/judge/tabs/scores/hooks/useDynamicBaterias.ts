
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DynamicBateria {
  id: number;
  numero: number;
  modalidade_id: number;
  evento_id: string;
  isFinal: boolean;
}

interface UseDynamicBateriasProps {
  modalityId: number;
  eventId: string | null;
  modalityRule?: any;
}

export function useDynamicBaterias({ modalityId, eventId, modalityRule }: UseDynamicBateriasProps) {
  const queryClient = useQueryClient();
  const [selectedBateriaId, setSelectedBateriaId] = useState<number | null>(null);
  
  // Check if this modality uses baterias
  const usesBaterias = modalityRule?.parametros?.baterias === true;

  // Fetch existing baterias
  const { data: baterias = [], isLoading } = useQuery({
    queryKey: ['dynamic-baterias', modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !usesBaterias) return [];
      
      const { data, error } = await supabase
        .from('baterias')
        .select('*')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .order('numero');

      if (error) {
        console.error('Error fetching baterias:', error);
        return [];
      }

      return (data || []).map(b => ({
        ...b,
        isFinal: b.numero === 999 // Special number for final bateria
      })) as DynamicBateria[];
    },
    enabled: !!eventId && !!modalityId && usesBaterias,
  });

  // Create new bateria mutation
  const createBateriaMutation = useMutation({
    mutationFn: async ({ isFinal = false }: { isFinal?: boolean }) => {
      if (!eventId) throw new Error('Event ID is required');
      
      // Get next number (999 for final, or max + 1 for regular)
      const nextNumber = isFinal ? 999 : (Math.max(0, ...baterias.filter(b => !b.isFinal).map(b => b.numero)) + 1);
      
      const { data, error } = await supabase
        .from('baterias')
        .insert({
          modalidade_id: modalityId,
          evento_id: eventId,
          numero: nextNumber
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, isFinal };
    },
    onSuccess: (newBateria) => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      setSelectedBateriaId(newBateria.id);
      toast.success(`${newBateria.isFinal ? 'Bateria Final' : `Bateria ${newBateria.numero}`} criada com sucesso!`);
    },
    onError: (error) => {
      console.error('Error creating bateria:', error);
      toast.error('Erro ao criar bateria');
    }
  });

  // Auto-select first bateria if none selected
  useEffect(() => {
    if (baterias.length > 0 && !selectedBateriaId) {
      setSelectedBateriaId(baterias[0].id);
    }
  }, [baterias, selectedBateriaId]);

  const selectedBateria = baterias.find(b => b.id === selectedBateriaId);
  const hasFinalBateria = baterias.some(b => b.isFinal);
  const regularBaterias = baterias.filter(b => !b.isFinal);
  const finalBateria = baterias.find(b => b.isFinal);

  return {
    baterias,
    selectedBateriaId,
    selectedBateria,
    regularBaterias,
    finalBateria,
    hasFinalBateria,
    usesBaterias,
    isLoading,
    setSelectedBateriaId,
    createNewBateria: () => createBateriaMutation.mutate({ isFinal: false }),
    createFinalBateria: () => createBateriaMutation.mutate({ isFinal: true }),
    isCreating: createBateriaMutation.isPending
  };
}
