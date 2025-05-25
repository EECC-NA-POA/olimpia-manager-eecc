
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { TimeScoreFormValues, DistanceScoreFormValues, PointsScoreFormValues } from '../types';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function useScoreSubmission(
  eventId: string | null,
  modalityId: number,
  athlete: AthleteData,
  judgeId: string,
  scoreType: 'tempo' | 'distancia' | 'pontos'
) {
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async (data: TimeScoreFormValues | DistanceScoreFormValues | PointsScoreFormValues) => {
      if (!eventId) throw new Error('Event ID is missing');
      
      // Convert form data based on score type
      let scoreData;
      
      if (scoreType === 'tempo' && 'minutes' in data) {
        const totalMs = (data.minutes * 60 * 1000) + (data.seconds * 1000) + data.milliseconds;
        scoreData = {
          tempo_minutos: data.minutes,
          tempo_segundos: data.seconds,
          tempo_milissegundos: data.milliseconds,
          valor_pontuacao: totalMs, // Store total milliseconds for ranking
          tipo_pontuacao: 'tempo',
          unidade: 'ms'
        };
      } else if (scoreType === 'distancia' && 'score' in data) {
        scoreData = {
          valor_pontuacao: data.score,
          tempo_minutos: null,
          tempo_segundos: null,
          tempo_milissegundos: null,
          tipo_pontuacao: 'distancia',
          unidade: 'm'
        };
      } else if (scoreType === 'pontos' && 'score' in data) {
        scoreData = {
          valor_pontuacao: data.score,
          tempo_minutos: null,
          tempo_segundos: null,
          tempo_milissegundos: null,
          tipo_pontuacao: 'pontos',
          unidade: 'pontos'
        };
      } else {
        throw new Error('Invalid form data format for score type');
      }
      
      const commonFields = {
        observacoes: data.notes || null,
        juiz_id: judgeId,
        data_registro: new Date().toISOString(),
        evento_id: eventId,
        modalidade_id: modalityId,
        atleta_id: athlete.atleta_id,
        equipe_id: athlete.equipe_id || null
      };
      
      // Check if score already exists
      const { data: existingScore } = await supabase
        .from('pontuacoes')
        .select('id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athlete.atleta_id)
        .maybeSingle();
      
      if (existingScore) {
        // Update existing score
        const { error } = await supabase
          .from('pontuacoes')
          .update({
            ...scoreData,
            ...commonFields
          })
          .eq('id', existingScore.id);
          
        if (error) throw error;
      } else {
        // Insert new score - the trigger will handle team replication
        const { error } = await supabase
          .from('pontuacoes')
          .insert({
            ...scoreData,
            ...commonFields
          });
          
        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['score', athlete.atleta_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['medal', athlete.atleta_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['modality-rankings', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['premiacoes', modalityId, eventId] });
      
      toast.success("Pontuação registrada com sucesso");
    },
    onError: (error) => {
      console.error('Error submitting score:', error);
      toast.error("Erro ao registrar pontuação");
    }
  });

  return { submitScoreMutation };
}
