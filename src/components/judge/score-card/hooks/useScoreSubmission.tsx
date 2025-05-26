
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
      if (!judgeId) throw new Error('Judge ID is missing');
      if (!athlete.atleta_id) throw new Error('Athlete ID is missing');
      
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
            unidade: 'm',
            tentativa_numero: formData.attempt || null
          };
          
          // Only include bateria_id if heat is provided and baterias are configured
          if (formData.heat && rule?.parametros?.baterias) {
            scoreData.bateria_id = formData.heat;
          }
        } else if ('score' in formData) {
          scoreData = {
            valor_pontuacao: formData.score,
            unidade: 'm',
            tentativa_numero: formData.attempt || null
          };
          
          // Only include bateria_id if heat is provided and baterias are configured
          if (formData.heat && rule?.parametros?.baterias) {
            scoreData.bateria_id = formData.heat;
          }
        }
      } else if (rule?.regra_tipo === 'tempo' || scoreType === 'tempo') {
        if ('minutes' in formData) {
          // For time scoring, store total milliseconds in valor_pontuacao
          const totalMs = (formData.minutes * 60 * 1000) + (formData.seconds * 1000) + formData.milliseconds;
          scoreData = {
            valor_pontuacao: totalMs,
            unidade: 'ms',
            tentativa_numero: formData.attempt || null
          };
          
          // Only include bateria_id if heat is provided and baterias are configured
          if (formData.heat && rule?.parametros?.baterias) {
            scoreData.bateria_id = formData.heat;
          }
        }
      } else {
        // Default to points scoring
        scoreData = {
          valor_pontuacao: formData.score || 0,
          unidade: 'pontos',
          tentativa_numero: formData.attempt || null
        };
        
        // Only include bateria_id if heat is provided and baterias are configured
        if (formData.heat && rule?.parametros?.baterias) {
          scoreData.bateria_id = formData.heat;
        }
      }
      
      if (!scoreData) {
        throw new Error('Failed to prepare score data');
      }
      
      console.log('Prepared score data:', scoreData);
      
      // Ensure all required fields are present
      const finalScoreData = {
        ...scoreData,
        observacoes: formData.notes || null,
        juiz_id: judgeId,
        data_registro: new Date().toISOString(),
        evento_id: eventId,
        modalidade_id: modalityId,
        atleta_id: athlete.atleta_id,
        equipe_id: athlete.equipe_id || null
      };
      
      console.log('Final score data being inserted:', finalScoreData);
      
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
        const { data, error } = await supabase
          .from('pontuacoes')
          .update(finalScoreData)
          .eq('id', existingScore.id)
          .select();
          
        if (error) {
          console.error('Error updating score:', error);
          throw error;
        }
        
        console.log('Score updated successfully:', data);
      } else {
        // Insert new score
        const { data, error } = await supabase
          .from('pontuacoes')
          .insert(finalScoreData)
          .select();
          
        if (error) {
          console.error('Error inserting score:', error);
          throw error;
        }
        
        console.log('Score inserted successfully:', data);
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
