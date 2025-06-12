
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
  const { data: modeloConfig, isLoading: isLoadingConfig } = useModeloConfiguration(modalityId);
  
  console.log('useDynamicBaterias - modeloConfig:', modeloConfig);
  
  // Check if this modality uses baterias
  const usesBaterias = modeloConfig?.parametros?.baterias === true;
  console.log('useDynamicBaterias - usesBaterias:', usesBaterias);

  // Fetch existing baterias
  const { data: baterias = [], isLoading } = useQuery({
    queryKey: ['dynamic-baterias', modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !modalityId) {
        console.log('Parâmetros faltando para buscar baterias:', { modalityId, eventId });
        return [];
      }
      
      console.log('Buscando baterias para modalidade:', modalityId, 'evento:', eventId);
      
      const { data, error } = await supabase
        .from('baterias')
        .select('*')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .order('numero');

      if (error) {
        console.error('Erro ao buscar baterias:', error);
        return [];
      }

      console.log('Baterias encontradas:', data?.length || 0);
      
      return (data || []).map(b => ({
        ...b,
        isFinal: b.numero === 999 // Special number for final bateria
      })) as DynamicBateria[];
    },
    enabled: !!eventId && !!modalityId,
  });

  // Create new bateria mutation
  const createBateriaMutation = useMutation({
    mutationFn: async ({ isFinal = false }: { isFinal?: boolean }) => {
      if (!eventId) throw new Error('ID do evento é obrigatório');
      
      console.log('Criando nova bateria. Final?', isFinal);
      console.log('Baterias existentes:', baterias.length);
      
      // Get next number - para bateria regular, sempre use número sequencial começando em 1
      const regularBaterias = baterias.filter(b => !b.isFinal);
      const nextNumber = isFinal ? 999 : (regularBaterias.length + 1);
      
      console.log('Próximo número de bateria:', nextNumber);
      
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

      if (error) {
        console.error('Erro ao criar bateria:', error);
        throw error;
      }
      
      console.log('Bateria criada com sucesso:', data);
      return { ...data, isFinal };
    },
    onSuccess: (newBateria) => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      setSelectedBateriaId(newBateria.id);
      toast.success(`${newBateria.isFinal ? 'Bateria Final' : `Bateria ${newBateria.numero}`} criada com sucesso!`);
    },
    onError: (error) => {
      console.error('Erro ao criar bateria:', error);
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

  // Auto-select first bateria when model uses baterias (but don't auto-create)
  useEffect(() => {
    console.log('useEffect - usesBaterias:', usesBaterias, 'modeloConfig:', !!modeloConfig, 'eventId:', eventId);
    console.log('useEffect - baterias.length:', baterias.length, 'selectedBateriaId:', selectedBateriaId);
    
    if (usesBaterias && modeloConfig && eventId && !isLoadingConfig) {
      // Only auto-select if we have baterias and no bateria is selected
      if (baterias.length > 0 && !selectedBateriaId) {
        const firstRegularBateria = baterias.find(b => !b.isFinal);
        if (firstRegularBateria) {
          console.log('Selecionando primeira bateria regular automaticamente:', firstRegularBateria.id);
          setSelectedBateriaId(firstRegularBateria.id);
        }
      }
    }
  }, [baterias, selectedBateriaId, usesBaterias, modeloConfig, eventId, isLoadingConfig]);

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
    isLoading: isLoading || isLoadingConfig,
    setSelectedBateriaId,
    createNewBateria: () => {
      console.log('Botão Nova Bateria clicado');
      createBateriaMutation.mutate({ isFinal: false });
    },
    createFinalBateria: () => {
      console.log('Botão Bateria Final clicado');
      createBateriaMutation.mutate({ isFinal: true });
    },
    editBateria: (bateriaId: number, novoNumero: number) => editBateriaMutation.mutate({ bateriaId, novoNumero }),
    isCreating: createBateriaMutation.isPending,
    isEditing: editBateriaMutation.isPending
  };
}
