
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
      console.log('=== INICIANDO CRIAÇÃO DE BATERIA ===');
      console.log('Parâmetros:', { modalityId, eventId, isFinal });
      console.log('Modelo config:', modeloConfig);
      
      if (!eventId) {
        console.error('ID do evento é obrigatório');
        throw new Error('ID do evento é obrigatório');
      }
      
      if (!modalityId) {
        console.error('ID da modalidade é obrigatório');
        throw new Error('ID da modalidade é obrigatório');
      }
      
      console.log('Criando nova bateria. Final?', isFinal);
      console.log('Baterias existentes:', baterias.length);
      
      // Get next number - para bateria regular, sempre use número sequencial começando em 1
      const regularBaterias = baterias.filter(b => !b.isFinal);
      const nextNumber = isFinal ? 999 : (regularBaterias.length + 1);
      
      console.log('Próximo número de bateria:', nextNumber);
      
      const insertData = {
        modalidade_id: modalityId,
        evento_id: eventId,
        numero: nextNumber,
        ...(modeloConfig?.modelo_id && { modelo_id: modeloConfig.modelo_id })
      };
      
      console.log('Dados para inserção:', insertData);
      
      const { data, error } = await supabase
        .from('baterias')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar bateria:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
        console.error('Detalhes do erro:', error.details);
        throw new Error(`Erro ao criar bateria: ${error.message}`);
      }
      
      if (!data) {
        console.error('Nenhum dado retornado após inserção');
        throw new Error('Nenhum dado retornado após criar bateria');
      }
      
      console.log('Bateria criada com sucesso:', data);
      return { ...data, isFinal };
    },
    onSuccess: (newBateria) => {
      console.log('=== SUCESSO NA CRIAÇÃO DA BATERIA ===');
      console.log('Nova bateria:', newBateria);
      
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      setSelectedBateriaId(newBateria.id);
      toast.success(`${newBateria.isFinal ? 'Bateria Final' : `Bateria ${newBateria.numero}`} criada com sucesso!`);
    },
    onError: (error) => {
      console.error('=== ERRO NA CRIAÇÃO DA BATERIA ===');
      console.error('Erro completo:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'Não disponível');
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar bateria';
      toast.error(`Erro ao criar bateria: ${errorMessage}`);
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
      console.log('=== BOTÃO NOVA BATERIA CLICADO ===');
      console.log('Estado atual:', { modalityId, eventId, modeloConfig });
      createBateriaMutation.mutate({ isFinal: false });
    },
    createFinalBateria: () => {
      console.log('=== BOTÃO BATERIA FINAL CLICADO ===');
      console.log('Estado atual:', { modalityId, eventId, modeloConfig });
      createBateriaMutation.mutate({ isFinal: true });
    },
    editBateria: (bateriaId: number, novoNumero: number) => editBateriaMutation.mutate({ bateriaId, novoNumero }),
    isCreating: createBateriaMutation.isPending,
    isEditing: editBateriaMutation.isPending
  };
}
