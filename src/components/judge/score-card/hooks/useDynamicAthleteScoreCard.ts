
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function useDynamicAthleteScoreCard(
  athlete: AthleteData,
  modalityId: number,
  eventId: string | null,
  judgeId: string
) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this modality has a dynamic scoring model
  const { data: modelos = [] } = useModelosModalidade(modalityId);
  const modelo = modelos[0]; // Assume one model per modality for now

  // Fetch existing score if it exists
  const { data: existingScore } = useQuery({
    queryKey: ['dynamic-score', athlete.atleta_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
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
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching existing dynamic score:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!eventId && !!athlete.atleta_id && !!modalityId,
  });

  // Expand form when score exists
  useEffect(() => {
    if (existingScore) {
      setIsExpanded(true);
    }
  }, [existingScore]);

  // Transform tentativas into form data
  const getInitialFormData = () => {
    if (!existingScore?.tentativas_pontuacao) return {};
    
    const formData: Record<string, any> = {};
    existingScore.tentativas_pontuacao.forEach((tentativa: any) => {
      formData[tentativa.chave_campo] = tentativa.valor;
    });
    
    if (existingScore.observacoes) {
      formData.notes = existingScore.observacoes;
    }
    
    return formData;
  };

  return {
    isExpanded,
    setIsExpanded,
    existingScore,
    modelo,
    hasDynamicScoring: !!modelo,
    initialFormData: getInitialFormData()
  };
}
