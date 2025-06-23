
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CalculationResult } from '@/types/dynamicScoring';

export function useCalculationOperations() {
  const queryClient = useQueryClient();

  const saveCalculationMutation = useMutation({
    mutationFn: async (results: CalculationResult[]) => {
      console.log('Saving calculation results:', results);

      for (const result of results) {
        // Get existing score data
        const { data: existingScore } = await supabase
          .from('pontuacoes')
          .select(`
            id,
            tentativas_pontuacao (
              id,
              chave_campo
            )
          `)
          .eq('atleta_id', result.atleta_id)
          .single();

        if (!existingScore) {
          console.warn(`No existing score found for athlete ${result.atleta_id}`);
          continue;
        }

        const existingTentativa = existingScore.tentativas_pontuacao?.find(
          (t: any) => t.chave_campo === result.chave_campo
        );

        if (existingTentativa) {
          // Update existing attempt
          const { error } = await supabase
            .from('tentativas_pontuacao')
            .update({
              valor: result.valor_calculado,
              calculado: true
            })
            .eq('id', existingTentativa.id);

          if (error) throw error;
        } else {
          // Create new attempt
          const { error } = await supabase
            .from('tentativas_pontuacao')
            .insert({
              pontuacao_id: existingScore.id,
              chave_campo: result.chave_campo,
              valor: result.valor_calculado,
              calculado: true
            });

          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculated-fields-scores'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-scores'] });
      toast.success('Cálculos salvos com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving calculations:', error);
      toast.error('Erro ao salvar cálculos');
    }
  });

  return {
    saveCalculation: saveCalculationMutation.mutateAsync,
    isSaving: saveCalculationMutation.isPending
  };
}
