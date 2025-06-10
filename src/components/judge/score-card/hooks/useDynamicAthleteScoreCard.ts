
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';

export function useDynamicAthleteScoreCard(
  athlete: any,
  modalityId: number,
  eventId: string | null,
  judgeId: string
) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get models for this modality
  const { data: modelos = [] } = useModelosModalidade(modalityId);
  const modelo = modelos[0]; // Use first model for now
  const hasDynamicScoring = modelos.length > 0;

  // Check for existing score
  const { data: existingScore } = useQuery({
    queryKey: ['dynamic-score', athlete.atleta_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !modelo) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao (
            chave_campo,
            valor
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .eq('modelo_id', modelo.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching existing score:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!eventId && !!modelo
  });

  // Prepare initial form data from existing score
  const initialFormData = existingScore?.tentativas_pontuacao?.reduce(
    (acc: any, tentativa: any) => {
      acc[tentativa.chave_campo] = tentativa.valor;
      return acc;
    },
    { notes: existingScore?.observacoes || '' }
  ) || {};

  return {
    isExpanded,
    setIsExpanded,
    existingScore,
    modelo,
    hasDynamicScoring,
    initialFormData
  };
}
