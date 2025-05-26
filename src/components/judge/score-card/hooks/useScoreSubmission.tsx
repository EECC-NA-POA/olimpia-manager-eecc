
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useModalityRules } from '../../tabs/scores/hooks/useModalityRules';

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
  const { data: rule } = useModalityRules(modalityId);

  const submitScoreMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!eventId) throw new Error('Event ID is missing');
      if (!rule) throw new Error('Modality rules not found');
      
      console.log('Form data received:', formData);
      console.log('Rule type:', rule.regra_tipo);
      console.log('Rule parameters:', rule.parametros);
      
      // Convert form data based on rule type
      let scoreData;
      
      switch (rule.regra_tipo) {
        case 'tempo':
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
          break;
          
        case 'distancia':
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
                total_meters: totalMeters
              },
              unidade: 'm'
            };
          } else if ('score' in formData) {
            scoreData = {
              valor_pontuacao: formData.score,
              tempo_minutos: null,
              tempo_segundos: null,
              tempo_milissegundos: null,
              dados_json: { distance: formData.score },
              unidade: 'm'
            };
          }
          break;
          
        case 'pontos':
          if ('score' in formData) {
            scoreData = {
              valor_pontuacao: formData.score,
              tempo_minutos: null,
              tempo_segundos: null,
              tempo_milissegundos: null,
              dados_json: { points: formData.score },
              unidade: 'pontos'
            };
          }
          break;
          
        case 'baterias':
          // For heats, store individual attempts and calculate best result
          const tentativas = formData.tentativas || [];
          console.log('Processing baterias data:', tentativas);
          
          const melhorTentativa = tentativas.reduce((melhor: any, atual: any) => {
            if (!melhor || (atual.valor > melhor.valor)) return atual;
            return melhor;
          }, null);
          
          scoreData = {
            valor_pontuacao: melhorTentativa?.valor || 0,
            tempo_minutos: null,
            tempo_segundos: null,
            tempo_milissegundos: null,
            dados_json: { 
              tentativas, 
              melhor_tentativa: melhorTentativa,
              num_tentativas: tentativas.length,
              tipo: 'baterias'
            },
            unidade: rule.parametros.unidade || 'pontos'
          };
          break;
          
        case 'sets':
          const sets = formData.sets || [];
          console.log('Processing sets data:', sets);
          
          const isVolleyball = rule.parametros.pontos_por_set !== undefined;
          const isTableTennis = rule.parametros.unidade === 'vitórias';
          
          if (rule.parametros.pontua_por_set !== false) {
            // Sum points from all sets
            const totalPontos = sets.reduce((total: number, set: any) => total + (set.pontos || 0), 0);
            scoreData = {
              valor_pontuacao: totalPontos,
              tempo_minutos: null,
              tempo_segundos: null,
              tempo_milissegundos: null,
              dados_json: { 
                sets, 
                total_pontos: totalPontos,
                tipo: 'sets_pontuacao'
              },
              unidade: 'pontos'
            };
          } else if (isVolleyball || isTableTennis) {
            // Enhanced sets scoring - count set victories
            const vitorias = sets.filter((set: any) => set.vencedor === 'vitoria').length;
            const derrotas = sets.filter((set: any) => set.vencedor === 'derrota').length;
            
            // Validate volleyball set scores if applicable
            if (isVolleyball) {
              for (let i = 0; i < sets.length; i++) {
                const set = sets[i];
                if (set.vencedor && (set.pontosEquipe1 !== undefined && set.pontosEquipe2 !== undefined)) {
                  const isSetFinal = i === 4;
                  const limitePontos = isSetFinal ? (rule.parametros.pontos_set_final || 15) : (rule.parametros.pontos_por_set || 25);
                  const vantagem = rule.parametros.vantagem || 2;
                  
                  const maxPontos = Math.max(set.pontosEquipe1, set.pontosEquipe2);
                  const minPontos = Math.min(set.pontosEquipe1, set.pontosEquipe2);
                  
                  // Validate set score
                  if (maxPontos < limitePontos || (maxPontos - minPontos) < vantagem) {
                    throw new Error(`Set ${i + 1} não atende aos critérios de pontuação do voleibol`);
                  }
                }
              }
            }
            
            scoreData = {
              valor_pontuacao: vitorias,
              tempo_minutos: null,
              tempo_segundos: null,
              tempo_milissegundos: null,
              dados_json: { 
                sets, 
                total_vitorias: vitorias, 
                total_derrotas: derrotas,
                detalhes_modalidade: isVolleyball ? 'volleyball' : 'table_tennis',
                tipo: 'sets_vitorias'
              },
              unidade: rule.parametros.unidade || 'vitorias'
            };
          } else {
            // Legacy victory-only scoring
            const vitorias = sets.filter((set: any) => set.vencedor === 'vitoria').length;
            scoreData = {
              valor_pontuacao: vitorias,
              tempo_minutos: null,
              tempo_segundos: null,
              tempo_milissegundos: null,
              dados_json: { 
                sets, 
                total_vitorias: vitorias,
                tipo: 'sets_simples'
              },
              unidade: 'vitorias'
            };
          }
          break;
          
        case 'arrows':
          const flechas = formData.flechas || [];
          console.log('Processing arrows data:', flechas);
          
          const totalPontos = flechas.reduce((total: number, flecha: any) => {
            const pontos = parseInt(flecha.zona || '0');
            return total + pontos;
          }, 0);
          
          scoreData = {
            valor_pontuacao: totalPontos,
            tempo_minutos: null,
            tempo_segundos: null,
            tempo_milissegundos: null,
            dados_json: { 
              flechas, 
              total_pontos: totalPontos,
              num_flechas: flechas.length,
              tipo: 'arrows'
            },
            unidade: 'pontos'
          };
          break;
          
        default:
          throw new Error(`Invalid rule type: ${rule.regra_tipo}`);
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
        regra_tipo: rule.regra_tipo
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
        // Insert new score - the trigger will handle team replication and ranking
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
      queryClient.invalidateQueries({ queryKey: ['team-score', athlete.equipe_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['medal', athlete.atleta_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['team-medal', athlete.equipe_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['modality-rankings', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['premiacoes', modalityId, eventId] });
      
      toast.success("Pontuação registrada com sucesso");
    },
    onError: (error) => {
      console.error('Error submitting score:', error);
      toast.error(`Erro ao registrar pontuação: ${error.message}`);
    }
  });

  return { submitScoreMutation };
}
