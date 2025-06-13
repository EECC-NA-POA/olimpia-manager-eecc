
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useModeloConfiguration } from './useModeloConfiguration';

export interface DynamicBateria {
  numero: number;
  modalidade_id: number;
  evento_id: string;
  modelo_id?: number;
  isFinal: boolean;
  atletasCount?: number;
}

interface UseDynamicBateriasProps {
  modalityId: number;
  eventId: string | null;
}

export function useDynamicBaterias({ modalityId, eventId }: UseDynamicBateriasProps) {
  const queryClient = useQueryClient();
  const [selectedBateriaId, setSelectedBateriaId] = useState<number | null>(null);
  const hasCreatedFirstBateria = useRef(false);
  
  // Get modelo configuration
  const { data: modeloConfig, isLoading: isLoadingConfig } = useModeloConfiguration(modalityId);
  
  // Check if this modality uses baterias
  const usesBaterias = modeloConfig?.parametros?.baterias === true;

  // Fetch existing baterias from pontuacoes table
  const { data: baterias = [], isLoading } = useQuery({
    queryKey: ['dynamic-baterias', modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !modalityId) {
        console.log('useDynamicBaterias: Missing parameters', { modalityId, eventId });
        return [];
      }
      
      console.log('useDynamicBaterias: Fetching baterias for modality:', modalityId, 'event:', eventId);
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('numero_bateria, atleta_id')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .not('numero_bateria', 'is', null)
        .order('numero_bateria');

      if (error) {
        console.error('useDynamicBaterias: Error fetching baterias:', error);
        return [];
      }
      
      console.log('useDynamicBaterias: Raw pontuacoes data:', data);
      
      // Group by numero_bateria and create bateria objects
      const bateriasMap = new Map<number, DynamicBateria>();
      
      data?.forEach(pontuacao => {
        const numeroBateria = pontuacao.numero_bateria;
        if (!bateriasMap.has(numeroBateria)) {
          bateriasMap.set(numeroBateria, {
            numero: numeroBateria,
            modalidade_id: modalityId,
            evento_id: eventId,
            modelo_id: modeloConfig?.modelo_id,
            isFinal: numeroBateria === 999,
            atletasCount: 0
          });
        }
        const bateria = bateriasMap.get(numeroBateria)!;
        bateria.atletasCount = (bateria.atletasCount || 0) + 1;
      });
      
      const bateriasArray = Array.from(bateriasMap.values()).sort((a, b) => a.numero - b.numero);
      console.log('useDynamicBaterias: Processed baterias:', bateriasArray);
      
      return bateriasArray;
    },
    enabled: !!eventId && !!modalityId,
  });

  // Create new bateria mutation
  const createBateriaMutation = useMutation({
    mutationFn: async ({ isFinal = false }: { isFinal?: boolean }) => {
      if (!eventId || !modalityId) {
        throw new Error('ID do evento e modalidade são obrigatórios');
      }
      
      console.log('Creating new bateria. Current baterias:', baterias);
      
      // Get next number
      const regularBaterias = baterias.filter(b => !b.isFinal);
      const nextNumber = isFinal ? 999 : (regularBaterias.length + 1);
      
      console.log('Next bateria number will be:', nextNumber);
      
      // Create a new bateria object (no database insert needed)
      const newBateria: DynamicBateria = {
        numero: nextNumber,
        modalidade_id: modalityId,
        evento_id: eventId,
        modelo_id: modeloConfig?.modelo_id,
        isFinal,
        atletasCount: 0
      };
      
      console.log('Created new bateria object:', newBateria);
      
      return newBateria;
    },
    onSuccess: (newBateria) => {
      console.log('Bateria created successfully:', newBateria);
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      setSelectedBateriaId(newBateria.numero);
      toast.success(`${newBateria.isFinal ? 'Bateria Final' : `Bateria ${newBateria.numero}`} criada com sucesso!`);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar bateria';
      console.error('Error creating bateria:', error);
      toast.error(errorMessage);
    }
  });

  // Auto-create first bateria and auto-select when model uses baterias
  useEffect(() => {
    if (usesBaterias && modeloConfig && eventId && !isLoadingConfig) {
      console.log('useEffect: Checking bateria auto-creation', {
        usesBaterias,
        bateriasLength: baterias.length,
        hasCreatedFirstBateria: hasCreatedFirstBateria.current,
        isPending: createBateriaMutation.isPending
      });
      
      // Se não há baterias e ainda não criamos a primeira
      if (baterias.length === 0 && !hasCreatedFirstBateria.current && !createBateriaMutation.isPending) {
        console.log('Auto-creating first bateria');
        hasCreatedFirstBateria.current = true;
        createBateriaMutation.mutate({ isFinal: false });
      } else if (baterias.length > 0 && !selectedBateriaId) {
        // Se há baterias mas nenhuma selecionada, selecionar a primeira regular
        const firstRegularBateria = baterias.find(b => !b.isFinal);
        if (firstRegularBateria) {
          console.log('Auto-selecting first regular bateria:', firstRegularBateria.numero);
          setSelectedBateriaId(firstRegularBateria.numero);
        }
      }
    }
  }, [usesBaterias, modeloConfig, eventId, isLoadingConfig, baterias.length, selectedBateriaId]);

  const selectedBateria = baterias.find(b => b.numero === selectedBateriaId);
  const hasFinalBateria = baterias.some(b => b.isFinal);
  const regularBaterias = baterias.filter(b => !b.isFinal);
  const finalBateria = baterias.find(b => b.isFinal);

  console.log('useDynamicBaterias state:', {
    baterias,
    selectedBateriaId,
    selectedBateria,
    regularBaterias,
    finalBateria,
    hasFinalBateria,
    usesBaterias
  });

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
      console.log('Creating new regular bateria');
      createBateriaMutation.mutate({ isFinal: false });
    },
    createFinalBateria: () => {
      console.log('Creating final bateria');
      createBateriaMutation.mutate({ isFinal: true });
    },
    isCreating: createBateriaMutation.isPending
  };
}
