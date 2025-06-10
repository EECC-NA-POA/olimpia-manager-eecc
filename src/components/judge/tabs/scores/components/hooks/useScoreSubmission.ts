
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
      console.log('Score submission data:', { athleteId, value, notes, modalityId, eventId, judgeId, scoreType, bateriaId });

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

      // Get bateria number if bateriaId is provided
      let numeroBateria: number | null = null;
      if (bateriaId) {
        const { data: bateriaData, error: bateriaError } = await supabase
          .from('baterias')
          .select('numero')
          .eq('id', bateriaId)
          .single();

        if (bateriaError) {
          console.error('Error fetching bateria:', bateriaError);
          throw new Error('Erro ao buscar dados da bateria');
        }

        numeroBateria = bateriaData.numero;
        console.log('Using bateria number:', numeroBateria);
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
        numero_bateria: numeroBateria,
        modelo_id: null, // Will be set for dynamic scoring
        raia: null, // Could be extended later for swimming/track events
        data_registro: new Date().toISOString()
      };

      console.log('Inserting score data:', scoreData);

      const { data, error } = await supabase
        .from('pontuacoes')
        .upsert(scoreData, {
          onConflict: 'atleta_id,modalidade_id,evento_id,juiz_id,modelo_id,numero_bateria',
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
      toast.success('Pontuação salva com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error saving score:', error);
      
      // Handle specific database errors
      if (error.message?.includes('numero_bateria')) {
        toast.error('Erro: Número da bateria não encontrado. Verifique a configuração da modalidade.');
      } else if (error.message?.includes('constraint')) {
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
