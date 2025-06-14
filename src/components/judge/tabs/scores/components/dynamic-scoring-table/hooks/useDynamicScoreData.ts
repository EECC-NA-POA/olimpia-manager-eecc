
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CampoModelo } from '@/types/dynamicScoring';
import { Athlete } from '../../../hooks/useAthletes';

interface UseDynamicScoreDataProps {
  modalityId: number;
  eventId: string;
  modeloId?: number;
  selectedBateriaId?: number | null;
  judgeId?: string;
  athletes?: Athlete[];
  enabled?: boolean;
}

export function useDynamicScoreData({
  modalityId,
  eventId,
  modeloId,
  selectedBateriaId,
  judgeId,
  athletes = [],
  enabled = true
}: UseDynamicScoreDataProps) {
  // Fetch campos from the modelo
  const { data: campos = [], isLoading: isLoadingCampos } = useQuery({
    queryKey: ['modelo-campos', modeloId],
    queryFn: async () => {
      if (!modeloId) return [];
      
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modeloId)
        .order('ordem_exibicao');
      
      if (error) {
        console.error('Error fetching campos:', error);
        return [];
      }
      
      return data as CampoModelo[];
    },
    enabled: enabled && !!modeloId,
  });

  // Fetch existing scores
  const { data: existingScores = [], isLoading: isLoadingScores, refetch: refetchScores } = useQuery({
    queryKey: ['dynamic-scores', modalityId, eventId, selectedBateriaId, judgeId],
    queryFn: async () => {
      if (!eventId || !modalityId || !judgeId || athletes.length === 0) return [];
      
      console.log('=== FETCHING EXISTING SCORES ===');
      console.log('Params:', { modalityId, eventId, selectedBateriaId, judgeId });
      
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          tentativas_pontuacao(*)
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('juiz_id', judgeId)
        .in('atleta_id', athletes.map(a => a.atleta_id));

      if (selectedBateriaId) {
        query = query.eq('numero_bateria', selectedBateriaId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching scores:', error);
        return [];
      }
      
      console.log('Raw fetched scores:', data);
      
      // Transform data to include both valor and valor_formatado
      const transformedData = (data || []).map(pontuacao => {
        const tentativas = pontuacao.tentativas_pontuacao?.reduce((acc: any, tentativa: any) => {
          acc[tentativa.chave_campo] = {
            valor: tentativa.valor,
            valor_formatado: tentativa.valor_formatado || tentativa.valor
          };
          return acc;
        }, {}) || {};
        
        console.log(`Atleta ${pontuacao.atleta_id} tentativas:`, tentativas);
        
        return {
          ...pontuacao,
          tentativas
        };
      });
      
      console.log('Transformed scores:', transformedData);
      return transformedData;
    },
    enabled: enabled && !!eventId && !!modalityId && !!judgeId && athletes.length > 0,
  });

  return {
    campos,
    existingScores,
    refetchScores,
    isLoading: isLoadingCampos || isLoadingScores
  };
}
