
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

  // Check for existing score with tentativas
  const { data: existingScore } = useQuery({
    queryKey: ['dynamic-score', athlete.atleta_id, modalityId, eventId, judgeId, modelo?.id],
    queryFn: async () => {
      if (!eventId || !modelo) return null;
      
      console.log('Fetching existing score for athlete:', athlete.atleta_id);
      
      const { data: pontuacao, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .eq('juiz_id', judgeId)
        .eq('modelo_id', modelo.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching existing score:', error);
        return null;
      }

      if (!pontuacao) {
        console.log('No existing score found for athlete:', athlete.atleta_id);
        return null;
      }

      console.log('Found existing pontuacao:', pontuacao);

      // Fetch tentativas for this pontuacao
      const { data: tentativas, error: tentativasError } = await supabase
        .from('tentativas_pontuacao')
        .select('*')
        .eq('pontuacao_id', pontuacao.id);

      if (tentativasError) {
        console.error('Error fetching tentativas:', tentativasError);
        return pontuacao; // Return pontuacao without tentativas
      }

      console.log('Found tentativas:', tentativas);

      // Convert tentativas array to object for easier access
      const tentativasObj = tentativas.reduce((acc: any, tentativa: any) => {
        acc[tentativa.chave_campo] = {
          valor: tentativa.valor,
          valor_formatado: tentativa.valor_formatado
        };
        return acc;
      }, {});

      return {
        ...pontuacao,
        tentativas: tentativasObj
      };
    },
    enabled: !!eventId && !!modelo && !!judgeId
  });

  // Prepare initial form data from existing score
  const initialFormData = existingScore?.tentativas ? 
    Object.keys(existingScore.tentativas).reduce((acc: any, fieldKey: string) => {
      const tentativa = existingScore.tentativas[fieldKey];
      acc[fieldKey] = tentativa.valor_formatado || tentativa.valor || '';
      return acc;
    }, { notes: existingScore?.observacoes || '' }) : 
    { notes: existingScore?.observacoes || '' };

  console.log('Initial form data prepared:', initialFormData);

  return {
    isExpanded,
    setIsExpanded,
    existingScore,
    modelo,
    hasDynamicScoring,
    initialFormData
  };
}
