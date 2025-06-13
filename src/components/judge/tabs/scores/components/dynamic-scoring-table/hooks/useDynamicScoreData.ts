
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../../../hooks/useAthletes';

interface UseDynamicScoreDataProps {
  modalityId: number;
  eventId: string;
  selectedBateriaId?: number | null;
  judgeId: string;
  athletes: Athlete[];
}

export function useDynamicScoreData({
  modalityId,
  eventId,
  selectedBateriaId,
  judgeId,
  athletes
}: UseDynamicScoreDataProps) {
  return useQuery({
    queryKey: ['dynamic-scores', modalityId, eventId, selectedBateriaId],
    queryFn: async () => {
      if (!eventId || !modalityId) return [];
      
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
    enabled: !!eventId && !!modalityId && athletes.length > 0,
  });
}
