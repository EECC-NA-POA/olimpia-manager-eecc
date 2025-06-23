
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UseCalculatedFieldsDataProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
}

export function useCalculatedFieldsData({
  modeloId,
  modalityId,
  eventId,
  bateriaId
}: UseCalculatedFieldsDataProps) {
  // Fetch calculated fields from model
  const { data: calculatedFields = [], isLoading: isLoadingFields } = useQuery({
    queryKey: ['calculated-fields', modeloId],
    queryFn: async () => {
      console.log('Fetching calculated fields for model:', modeloId);
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modeloId)
        .eq('tipo_input', 'calculated')
        .order('ordem_exibicao');

      if (error) {
        console.error('Error fetching calculated fields:', error);
        throw error;
      }
      
      console.log('Calculated fields found:', data);
      return data;
    },
    enabled: !!modeloId
  });

  // Fetch current scores for ranking calculation
  const { data: scores = [], isLoading: isLoadingScores } = useQuery({
    queryKey: ['modality-scores-for-ranking', modalityId, eventId, bateriaId],
    queryFn: async () => {
      console.log('Fetching scores for ranking calculation:', { modalityId, eventId, bateriaId });
      
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          usuarios!pontuacoes_atleta_id_fkey(nome_completo),
          tentativas_pontuacao(
            chave_campo,
            valor,
            valor_formatado
          )
        `)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('modelo_id', modeloId);

      if (bateriaId) {
        query = query.eq('numero_bateria', bateriaId);
      }

      const { data, error } = await query.order('valor_pontuacao', { ascending: false });

      if (error) {
        console.error('Error fetching scores for ranking:', error);
        throw error;
      }
      
      console.log('Scores found for ranking:', data);
      return data;
    },
    enabled: !!modalityId && !!eventId && !!modeloId
  });

  return {
    calculatedFields,
    scores,
    isLoadingFields,
    isLoadingScores,
    isLoading: isLoadingFields || isLoadingScores
  };
}
