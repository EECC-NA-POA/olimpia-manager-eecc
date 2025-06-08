
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DynamicFormData } from '@/types/dynamicScoring';

interface SubmissionData {
  eventId: string;
  modalityId: number;
  athleteId: string;
  equipeId?: number;
  judgeId: string;
  modeloId: number;
  bateriaId?: number;
  raia?: number;
  formData: DynamicFormData;
  notes?: string;
}

export function useDynamicScoringSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmissionData) => {
      const {
        eventId,
        modalityId,
        athleteId,
        equipeId,
        judgeId,
        modeloId,
        bateriaId,
        raia,
        formData,
        notes
      } = data;

      console.log('=== DYNAMIC SCORING SUBMISSION START ===');
      console.log('Submission data:', JSON.stringify(data, null, 2));

      // Calculate main score based on form data
      // For now, we'll use the first numeric field as the main score
      // This could be made more sophisticated based on the modelo_codigo
      const numericFields = Object.entries(formData).filter(([_, value]) => 
        typeof value === 'number' && !isNaN(value)
      );
      
      const mainScore = numericFields.length > 0 ? numericFields[0][1] as number : 0;

      // Insert main pontuacao record
      const { data: pontuacao, error: pontuacaoError } = await supabase
        .from('pontuacoes')
        .insert({
          evento_id: eventId,
          modalidade_id: modalityId,
          atleta_id: athleteId,
          equipe_id: equipeId,
          juiz_id: judgeId,
          modelo_id: modeloId,
          bateria_id: bateriaId,
          raia: raia,
          valor_pontuacao: mainScore,
          observacoes: notes,
          data_pontuacao: new Date().toISOString()
        })
        .select()
        .single();

      if (pontuacaoError) {
        console.error('Error inserting pontuacao:', pontuacaoError);
        throw pontuacaoError;
      }

      console.log('Pontuacao inserted:', pontuacao);

      // Insert tentativas_pontuacao for each form field
      const tentativas = Object.entries(formData)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([chave_campo, valor]) => ({
          pontuacao_id: pontuacao.id,
          chave_campo,
          valor: typeof valor === 'number' ? valor : parseFloat(valor as string) || 0
        }));

      if (tentativas.length > 0) {
        const { error: tentativasError } = await supabase
          .from('tentativas_pontuacao')
          .insert(tentativas);

        if (tentativasError) {
          console.error('Error inserting tentativas:', tentativasError);
          throw tentativasError;
        }

        console.log('Tentativas inserted:', tentativas);
      }

      console.log('=== DYNAMIC SCORING SUBMISSION SUCCESS ===');
      return pontuacao;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['scores', variables.modalityId, variables.eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['score', variables.athleteId, variables.modalityId, variables.eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['athletes', variables.modalityId, variables.eventId] 
      });
      
      toast.success("Pontuação registrada com sucesso");
    },
    onError: (error: any) => {
      console.error('=== DYNAMIC SCORING SUBMISSION ERROR ===');
      console.error('Error:', error);
      
      const errorMessage = error?.message || 'Erro desconhecido ao registrar pontuação';
      toast.error(`Erro ao registrar pontuação: ${errorMessage}`);
    }
  });
}
