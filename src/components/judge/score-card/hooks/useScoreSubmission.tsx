
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
          
          // Validate bateria exists before including bateria_id
          if (formData.heat && rule?.parametros?.baterias) {
            console.log('Checking if bateria exists for heat:', formData.heat);
            
            const { data: bateriaExists } = await supabase
              .from('baterias')
              .select('id')
              .eq('id', formData.heat)
              .eq('modalidade_id', modalityId)
              .eq('evento_id', eventId)
              .maybeSingle();
            
            if (bateriaExists) {
              console.log('Bateria exists, adding bateria_id:', formData.heat);
              scoreData.bateria_id = formData.heat;
            } else {
              console.warn('Bateria does not exist, skipping bateria_id');
            }
          }
        } else if ('score' in formData) {
          scoreData = {
            valor_pontuacao: formData.score,
            unidade: 'm',
            tentativa_numero: formData.attempt || null
          };
          
          // Validate bateria exists before including bateria_id
          if (formData.heat && rule?.parametros?.baterias) {
            console.log('Checking if bateria exists for score format:', formData.heat);
            
            const { data: bateriaExists } = await supabase
              .from('baterias')
              .select('id')
              .eq('id', formData.heat)
              .eq('modalidade_id', modalityId)
              .eq('evento_id', eventId)
              .maybeSingle();
            
            if (bateriaExists) {
              console.log('Bateria exists for score format, adding bateria_id:', formData.heat);
              scoreData.bateria_id = formData.heat;
            } else {
              console.warn('Bateria does not exist for score format, skipping bateria_id');
            }
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
          
          // Validate bateria exists before including bateria_id
          if (formData.heat && rule?.parametros?.baterias) {
            console.log('Checking if bateria exists for time:', formData.heat);
            
            const { data: bateriaExists } = await supabase
              .from('baterias')
              .select('id')
              .eq('id', formData.heat)
              .eq('modalidade_id', modalityId)
              .eq('evento_id', eventId)
              .maybeSingle();
            
            if (bateriaExists) {
              console.log('Bateria exists for time, adding bateria_id:', formData.heat);
              scoreData.bateria_id = formData.heat;
            } else {
              console.warn('Bateria does not exist for time, skipping bateria_id');
            }
          }
        }
      } else {
        // Default to points scoring
        scoreData = {
          valor_pontuacao: formData.score || 0,
          unidade: 'pontos',
          tentativa_numero: formData.attempt || null
        };
        
        // Validate bateria exists before including bateria_id
        if (formData.heat && rule?.parametros?.baterias) {
          console.log('Checking if bateria exists for points:', formData.heat);
          
          const { data: bateriaExists } = await supabase
            .from('baterias')
            .select('id')
            .eq('id', formData.heat)
            .eq('modalidade_id', modalityId)
            .eq('evento_id', eventId)
            .maybeSingle();
          
          if (bateriaExists) {
            console.log('Bateria exists for points, adding bateria_id:', formData.heat);
            scoreData.bateria_id = formData.heat;
          } else {
            console.warn('Bateria does not exist for points, skipping bateria_id');
          }
        }
      }
      
      if (!scoreData) {
        throw new Error('Failed to prepare score data');
      }
      
      console.log('Prepared score data (before final data):', scoreData);
      
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
      console.log('Final score data has bateria_id?', 'bateria_id' in finalScoreData);
      
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
