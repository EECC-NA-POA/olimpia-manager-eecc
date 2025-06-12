
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../../hooks/useAthletes';

interface SubmitScoreParams {
  athleteId: string;
  value: string;
  notes: string;
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  bateriaId?: number | null;
}

export function useScoreSubmission() {
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async ({ athleteId, value, notes, athletes, modalityId, eventId, judgeId, scoreType, bateriaId }: SubmitScoreParams) => {
      if (!eventId) throw new Error('Event ID is required');
      
      const athlete = athletes.find(a => a.atleta_id === athleteId);
      if (!athlete) throw new Error('Athlete not found');

      console.log('=== SCORE SUBMISSION START ===');
      console.log('Score submission data:', { athleteId, value, notes, modalityId, eventId, judgeId, scoreType });

      // Convert value based on score type
      let processedValue: number;
      if (scoreType === 'tempo') {
        const timeParts = value.split(':');
        if (timeParts.length === 2) {
          const minutes = parseInt(timeParts[0]) || 0;
          const seconds = parseFloat(timeParts[1]) || 0;
          processedValue = minutes * 60 + seconds;
        } else {
          processedValue = parseFloat(value) || 0;
        }
      } else {
        processedValue = parseFloat(value) || 0;
      }

      // Prepare the score data according to the pontuacoes table structure
      const scoreData = {
        evento_id: eventId,
        modalidade_id: modalityId,
        atleta_id: athleteId,
        equipe_id: null, // For individual scores
        juiz_id: judgeId,
        valor_pontuacao: processedValue,
        unidade: scoreType === 'tempo' ? 'segundos' : scoreType === 'distancia' ? 'metros' : 'pontos',
        observacoes: notes || null,
        numero_bateria: bateriaId,
        data_registro: new Date().toISOString()
      };

      console.log('Upserting score data:', scoreData);

      // Use upsert to avoid duplicates based on the unique constraint
      const { data, error } = await supabase
        .from('pontuacoes')
        .upsert(scoreData, {
          onConflict: 'atleta_id,modalidade_id,evento_id,juiz_id,modelo_id,numero_bateria',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving score:', error);
        throw error;
      }

      console.log('Score saved successfully:', data);
      console.log('=== SCORE SUBMISSION SUCCESS ===');
      return data;
    },
    onSuccess: (_, { modalityId, eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-baterias', modalityId, eventId] });
      toast.success('Pontuação salva com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error saving score:', error);
      
      // Handle specific database errors
      if (error.message?.includes('constraint')) {
        toast.error('Erro de restrição do banco de dados. Verifique os dados informados.');
      } else if (error.message?.includes('foreign key')) {
        toast.error('Erro: Dados de referência inválidos.');
      } else {
        toast.error('Erro ao salvar pontuação: ' + (error.message || 'Erro desconhecido'));
      }
    },
  });

  return { submitScoreMutation };
}
