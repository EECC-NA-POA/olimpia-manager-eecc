
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

export function useScoreSubmission(
  eventId: string | null,
  modalityId: number,
  athlete: AthleteData,
  judgeId: string,
  scoreType: 'tempo' | 'distancia' | 'pontos',
  modalityRule?: any
) {
  const queryClient = useQueryClient();

  const submitScoreMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!eventId) throw new Error('Event ID is missing');
      
      console.log('Form data received:', formData);
      console.log('Modality rule:', modalityRule);
      
      // If no modalityRule provided, fall back to basic scoring
      const rule = modalityRule;
      
      // Convert form data based on rule type or scoreType
      let scoreData;
      
      if (rule?.regra_tipo === 'distancia' || scoreType === 'distancia') {
        if ('meters' in formData && 'centimeters' in formData) {
          // Convert meters and centimeters to total meters
          const totalMeters = formData.meters + (formData.centimeters / 100);
          scoreData = {
            valor_pontuacao: totalMeters,
            tempo_minutos: null,
            tempo_segundos: null,
            tempo_milissegundos: null,
            dados_json: { 
              meters: formData.meters, 
              centimeters: formData.centimeters,
              total_meters: totalMeters,
              heat: formData.heat || null,
              lane: formData.lane || null
            },
            unidade: 'm',
            bateria_id: formData.heat || null,
            raia: formData.lane || null
          };
        } else if ('score' in formData) {
          scoreData = {
            valor_pontuacao: formData.score,
            tempo_minutos: null,
            tempo_segundos: null,
            tempo_milissegundos: null,
            dados_json: { 
              distance: formData.score,
              heat: formData.heat || null,
              lane: formData.lane || null
            },
            unidade: 'm',
            bateria_id: formData.heat || null,
            raia: formData.lane || null
          };
        }
      } else if (rule?.regra_tipo === 'tempo' || scoreType === 'tempo') {
        if ('minutes' in formData) {
          const totalMs = (formData.minutes * 60 * 1000) + (formData.seconds * 1000) + formData.milliseconds;
          scoreData = {
            tempo_minutos: formData.minutes,
            tempo_segundos: formData.seconds,
            tempo_milissegundos: formData.milliseconds,
            valor_pontuacao: totalMs,
            dados_json: {
              minutes: formData.minutes,
              seconds: formData.seconds,
              milliseconds: formData.milliseconds,
              total_ms: totalMs
            },
            unidade: 'ms'
          };
        }
      } else {
        // Default to points scoring
        scoreData = {
          valor_pontuacao: formData.score || 0,
          tempo_minutos: null,
          tempo_segundos: null,
          tempo_milissegundos: null,
          dados_json: { points: formData.score || 0 },
          unidade: 'pontos'
        };
      }
      
      console.log('Prepared score data:', scoreData);
      
      const commonFields = {
        observacoes: formData.notes || null,
        juiz_id: judgeId,
        data_registro: new Date().toISOString(),
        evento_id: eventId,
        modalidade_id: modalityId,
        atleta_id: athlete.atleta_id,
        equipe_id: athlete.equipe_id || null,
        regra_tipo: rule?.regra_tipo || scoreType
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
          
        if (error) {
          console.error('Error updating score:', error);
          throw error;
        }
        
        console.log('Score updated successfully');
      } else {
        // Insert new score
        const { error } = await supabase
          .from('pontuacoes')
          .insert({
            ...scoreData,
            ...commonFields
          });
          
        if (error) {
          console.error('Error inserting score:', error);
          throw error;
        }
        
        console.log('Score inserted successfully');
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['score', athlete.atleta_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['modality-rankings', modalityId, eventId] });
      
      toast.success("Pontuação registrada com sucesso");
    },
    onError: (error) => {
      console.error('Error submitting score:', error);
      toast.error(`Erro ao registrar pontuação: ${error.message}`);
    }
  });

  return { submitScoreMutation };
}
