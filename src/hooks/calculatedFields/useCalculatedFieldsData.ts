
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCamposModelo } from '@/hooks/useDynamicScoring';
import { UseCalculatedFieldsProps } from './types';

export function useCalculatedFieldsData({
  modeloId,
  modalityId,
  eventId,
  bateriaId
}: UseCalculatedFieldsProps) {
  const { data: allFields = [] } = useCamposModelo(modeloId);
  
  // Filter only calculated fields
  const calculatedFields = allFields.filter(campo => campo.tipo_input === 'calculated');

  // Fetch existing scores to check which fields can be calculated
  const { data: existingScores = [] } = useQuery({
    queryKey: ['calculated-fields-scores', modalityId, eventId, bateriaId],
    queryFn: async () => {
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao (
            chave_campo,
            valor,
            calculado
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('modelo_id', modeloId);

      if (bateriaId) {
        query = query.eq('bateria_id', bateriaId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId && !!modeloId
  });

  return {
    allFields,
    calculatedFields,
    existingScores
  };
}
