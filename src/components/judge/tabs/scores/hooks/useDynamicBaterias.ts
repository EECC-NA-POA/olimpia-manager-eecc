
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useModeloConfiguration } from './useModeloConfiguration';

export interface DynamicBateria {
  id: number;
  numero: number;
  modalidade_id: number;
  evento_id: string;
  modelo_id?: number;
  isFinal: boolean;
}

interface UseDynamicBateriasProps {
  modalityId: number;
  eventId: string | null;
}

export function useDynamicBaterias({ modalityId, eventId }: UseDynamicBateriasProps) {
  const queryClient = useQueryClient();
  const [selectedBateriaId, setSelectedBateriaId] = useState<number | null>(null);
  
  // Get modelo configuration
  const { data: modeloConfig } = useModeloConfiguration(modalityId);
  
  // Check if this modality uses baterias
  const usesBaterias = modeloConfig?.parametros?.baterias === true;

  // Fetch existing baterias
  const { data: baterias = [], isLoading } = useQuery({
    queryKey: ['dynamic-baterias', modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !modalityId || !usesBaterias) return [];
      
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
      
      // Get next number - para bateria regular, sempre use número sequencial começando em 1
      const regularBaterias = baterias.filter(b => !b.isFinal);
      const nextNumber = isFinal ? 999 : (regularBaterias.length + 1);
      
      const { data, error } = await supabase
        .from('baterias')
        .insert({
          modalidade_id: modalityId,
          evento_id: eventId,
          modelo_id: modeloConfig?.modelo_id,
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

  // Edit bateria mutation
  const editBateriaMutation = useMutation({
    mutationFn: async ({ bateriaId, novoNumero }: { bateriaId: number, novoNumero: number }) => {
      const { data, error } = await supabase
        .from('baterias')
        .update({ numero: novoNumero })
        .eq('id', bateriaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      toast.success('Bateria editada com sucesso!');
    },
    onError: (error) => {
      console.error('Error editing bateria:', error);
      toast.error('Erro ao editar bateria');
    }
  });

  // Auto-create first bateria and select it when model uses baterias
  useEffect(() => {
    if (usesBaterias && modeloConfig && eventId) {
      if (baterias.length === 0 && !createBateriaMutation.isPending) {
        // Create first bateria automatically
        createBateriaMutation.mutate({ isFinal: false });
      } else if (baterias.length > 0 && !selectedBateriaId) {
        // Select first regular bateria
        const firstRegularBateria = baterias.find(b => !b.isFinal);
        if (firstRegularBateria) {
          setSelectedBateriaId(firstRegularBateria.id);
        }
      }
    }
  }, [baterias, selectedBateriaId, usesBaterias, modeloConfig, eventId]);

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
    editBateria: (bateriaId: number, novoNumero: number) => editBateriaMutation.mutate({ bateriaId, novoNumero }),
    isCreating: createBateriaMutation.isPending,
    isEditing: editBateriaMutation.isPending
  };
}
