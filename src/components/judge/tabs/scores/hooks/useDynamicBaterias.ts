
import { useState, useEffect } from 'react';
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
  
  // Get modelo configuration
  const { data: modeloConfig, isLoading: isLoadingConfig } = useModeloConfiguration(modalityId);
  
  console.log('useDynamicBaterias - modeloConfig:', modeloConfig);
  
  // Check if this modality uses baterias
  const usesBaterias = modeloConfig?.parametros?.baterias === true;
  console.log('useDynamicBaterias - usesBaterias:', usesBaterias);

  // Fetch existing baterias from pontuacoes table
  const { data: baterias = [], isLoading } = useQuery({
    queryKey: ['dynamic-baterias', modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !modalityId) {
        console.log('Parâmetros faltando para buscar baterias:', { modalityId, eventId });
        return [];
      }
      
      console.log('Buscando baterias para modalidade:', modalityId, 'evento:', eventId);
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('numero_bateria, atleta_id')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .not('numero_bateria', 'is', null)
        .order('numero_bateria');

      if (error) {
        console.error('Erro ao buscar baterias:', error);
        return [];
      }

      console.log('Pontuações com bateria encontradas:', data?.length || 0);
      
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
      
      return Array.from(bateriasMap.values()).sort((a, b) => a.numero - b.numero);
    },
    enabled: !!eventId && !!modalityId,
  });

  // Create new bateria mutation
  const createBateriaMutation = useMutation({
    mutationFn: async ({ isFinal = false }: { isFinal?: boolean }) => {
      console.log('=== CRIANDO NOVA BATERIA ===');
      console.log('Parâmetros:', { modalityId, eventId, isFinal });
      
      if (!eventId) {
        throw new Error('ID do evento é obrigatório');
      }
      
      if (!modalityId) {
        throw new Error('ID da modalidade é obrigatório');
      }
      
      // Get next number
      const regularBaterias = baterias.filter(b => !b.isFinal);
      const nextNumber = isFinal ? 999 : (regularBaterias.length + 1);
      
      console.log('Próximo número de bateria:', nextNumber);
      
      // Create a new bateria object (no database insert needed)
      const newBateria: DynamicBateria = {
        numero: nextNumber,
        modalidade_id: modalityId,
        evento_id: eventId,
        modelo_id: modeloConfig?.modelo_id,
        isFinal,
        atletasCount: 0
      };
      
      console.log('Nova bateria criada:', newBateria);
      return newBateria;
    },
    onSuccess: (newBateria) => {
      console.log('=== SUCESSO NA CRIAÇÃO DA BATERIA ===');
      console.log('Nova bateria:', newBateria);
      
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      setSelectedBateriaId(newBateria.numero);
      toast.success(`${newBateria.isFinal ? 'Bateria Final' : `Bateria ${newBateria.numero}`} criada com sucesso!`);
    },
    onError: (error) => {
      console.error('=== ERRO NA CRIAÇÃO DA BATERIA ===');
      console.error('Erro completo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar bateria';
      toast.error(errorMessage);
    }
  });

  // Auto-select first bateria when model uses baterias
  useEffect(() => {
    console.log('useEffect - usesBaterias:', usesBaterias, 'modeloConfig:', !!modeloConfig, 'eventId:', eventId);
    console.log('useEffect - baterias.length:', baterias.length, 'selectedBateriaId:', selectedBateriaId);
    
    if (usesBaterias && modeloConfig && eventId && !isLoadingConfig) {
      if (baterias.length > 0 && !selectedBateriaId) {
        const firstRegularBateria = baterias.find(b => !b.isFinal);
        if (firstRegularBateria) {
          console.log('Selecionando primeira bateria regular automaticamente:', firstRegularBateria.numero);
          setSelectedBateriaId(firstRegularBateria.numero);
        }
      }
    }
  }, [baterias, selectedBateriaId, usesBaterias, modeloConfig, eventId, isLoadingConfig]);

  const selectedBateria = baterias.find(b => b.numero === selectedBateriaId);
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
      console.log('=== BOTÃO NOVA BATERIA CLICADO ===');
      createBateriaMutation.mutate({ isFinal: false });
    },
    createFinalBateria: () => {
      console.log('=== BOTÃO BATERIA FINAL CLICADO ===');
      createBateriaMutation.mutate({ isFinal: true });
    },
    isCreating: createBateriaMutation.isPending
  };
}
