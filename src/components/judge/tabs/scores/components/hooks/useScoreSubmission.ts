
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
}

export function useScoreSubmission() {
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async ({ athleteId, value, notes, athletes, modalityId, eventId, judgeId, scoreType }: SubmitScoreParams) => {
      if (!eventId) throw new Error('Event ID is required');
      
      const athlete = athletes.find(a => a.atleta_id === athleteId);
      if (!athlete) throw new Error('Athlete not found');

      // Convert value based on score type
      let processedValue: number;
      if (scoreType === 'tempo') {
        // Assuming time format MM:SS.mmm
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

      const { data, error } = await supabase
        .from('pontuacoes')
        .upsert({
          evento_id: eventId,
          modalidade_id: modalityId,
          atleta_id: athleteId,
          equipe_id: athlete.equipe_id,
          juiz_id: judgeId,
          valor_pontuacao: processedValue,
          observacoes: notes || null,
          tipo_pontuacao: scoreType,
        }, {
          onConflict: 'evento_id,modalidade_id,atleta_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { modalityId, eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['athlete-scores', modalityId, eventId] });
      toast.success('Pontuação salva com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving score:', error);
      toast.error('Erro ao salvar pontuação');
    },
  });

  return { submitScoreMutation };
}
