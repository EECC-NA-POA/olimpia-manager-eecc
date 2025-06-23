
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useModeloConfiguration } from './useModeloConfiguration';

export function useModalityWithModelo(modalityId: number | null) {
  // Get the modelo configuration
  const { data: modeloConfig, isLoading: isLoadingModelo } = useModeloConfiguration(modalityId);
  
  // Get the complete modality data with modelo information
  const { data: modalityData, isLoading: isLoadingModality } = useQuery({
    queryKey: ['modality-with-modelo', modalityId],
    queryFn: async () => {
      if (!modalityId) return null;
      
      console.log('Fetching modality with modelo data for:', modalityId);
      
      // Get modality basic info
      const { data: modality, error: modalityError } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_pontuacao, tipo_modalidade')
        .eq('id', modalityId)
        .single();
      
      if (modalityError) {
        console.error('Error fetching modality:', modalityError);
        throw modalityError;
      }
      
      // Get modelo for this modality
      const { data: modelo, error: modeloError } = await supabase
        .from('modelos_modalidade')
        .select(`
          id,
          codigo_modelo,
          descricao,
          campos_modelo (
            id,
            chave_campo,
            rotulo_campo,
            tipo_input,
            obrigatorio,
            ordem_exibicao,
            metadados
          )
        `)
        .eq('modalidade_id', modalityId)
        .maybeSingle();
      
      if (modeloError) {
        console.error('Error fetching modelo:', modeloError);
        // Don't throw, just continue without modelo
      }
      
      console.log('Found modality data:', modality);
      console.log('Found modelo data:', modelo);
      
      return {
        modality,
        modelo,
        hasModelo: !!modelo,
        campos: modelo?.campos_modelo || []
      };
    },
    enabled: !!modalityId,
  });

  // Build the legacy rule format for backward compatibility
  const modalityRule = modeloConfig ? {
    regra_tipo: modeloConfig.parametros.regra_tipo || 'pontos',
    parametros: modeloConfig.parametros
  } : null;

  return {
    data: modalityData,
    modalityRule,
    isLoading: isLoadingModality || isLoadingModelo,
    hasModelo: modalityData?.hasModelo || false,
    campos: modalityData?.campos || []
  };
}
