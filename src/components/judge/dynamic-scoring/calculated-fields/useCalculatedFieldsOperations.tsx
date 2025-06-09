
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseCalculatedFieldsOperationsProps {
  modalityId: number;
  eventId: string;
  bateriaId?: number;
  onCalculationComplete?: (results: any[]) => void;
}

export function useCalculatedFieldsOperations({
  modalityId,
  eventId,
  bateriaId,
  onCalculationComplete
}: UseCalculatedFieldsOperationsProps) {
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRankingsMutation = useMutation({
    mutationFn: async ({ calculatedFields, scores }: { calculatedFields: any[], scores: any[] }) => {
      setIsCalculating(true);
      console.log('Starting ranking calculation...');
      
      try {
        const results = [];
        
        for (const field of calculatedFields) {
          console.log('Processing calculated field:', field);
          
          const { tipo_calculo, ordem_calculo, campo_referencia } = field.metadados || {};
          
          if (tipo_calculo === 'colocacao_bateria' || tipo_calculo === 'colocacao_final') {
            if (!campo_referencia) {
              console.warn('Campo de referência não definido para:', field.chave_campo);
              continue;
            }

            // Get scores with reference field values
            const scoresWithReference = scores
              .map(score => {
                const tentativa = score.tentativas_pontuacao?.find(
                  (t: any) => t.chave_campo === campo_referencia
                );
                
                if (!tentativa) return null;

                return {
                  score_id: score.id,
                  atleta_id: score.atleta_id,
                  atleta_nome: score.usuarios?.nome_completo || 'Atleta',
                  valor: tentativa.valor,
                  valor_formatado: tentativa.valor_formatado
                };
              })
              .filter(item => item !== null);

            console.log('Scores with reference field:', scoresWithReference);

            if (scoresWithReference.length === 0) {
              console.warn('Nenhum score encontrado com campo de referência:', campo_referencia);
              continue;
            }

            // Sort based on calculation order
            const sortedScores = [...scoresWithReference].sort((a, b) => {
              if (ordem_calculo === 'asc') {
                return a.valor - b.valor; // Lower value = better position
              } else {
                return b.valor - a.valor; // Higher value = better position
              }
            });

            console.log('Sorted scores:', sortedScores);

            // Calculate placements (considering ties)
            let currentPosition = 1;
            let previousValue: number | null = null;

            for (let i = 0; i < sortedScores.length; i++) {
              const score = sortedScores[i];
              
              if (previousValue === null || score.valor !== previousValue) {
                currentPosition = i + 1;
              }

              // Update or create tentativa_pontuacao for calculated field
              const { error: upsertError } = await supabase
                .from('tentativas_pontuacao')
                .upsert({
                  pontuacao_id: score.score_id,
                  chave_campo: field.chave_campo,
                  valor: currentPosition,
                  valor_formatado: `${currentPosition}º`
                }, {
                  onConflict: 'pontuacao_id,chave_campo'
                });

              if (upsertError) {
                console.error('Error updating calculated field:', upsertError);
                throw upsertError;
              }

              results.push({
                chave_campo: field.chave_campo,
                atleta_id: score.atleta_id,
                atleta_nome: score.atleta_nome,
                valor_calculado: currentPosition,
                posicao: `${currentPosition}º`
              });
              
              previousValue = score.valor;
            }
          }
        }

        console.log('Calculation results:', results);
        return results;
      } finally {
        setIsCalculating(false);
      }
    },
    onSuccess: (results) => {
      console.log('Calculation completed successfully:', results);
      toast.success(`Colocações calculadas com sucesso! ${results.length} registros atualizados.`);
      onCalculationComplete?.(results);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-dynamic-scores', modalityId, eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-scores-for-ranking', modalityId, eventId, bateriaId] 
      });
    },
    onError: (error) => {
      console.error('Error calculating rankings:', error);
      toast.error('Erro ao calcular colocações');
    }
  });

  return {
    isCalculating,
    calculateRankings: calculateRankingsMutation.mutate,
    isError: calculateRankingsMutation.isError,
    isPending: calculateRankingsMutation.isPending
  };
}
