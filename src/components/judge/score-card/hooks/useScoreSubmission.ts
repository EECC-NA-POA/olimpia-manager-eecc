
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { z } from 'zod';
import { parseTimeToMilliseconds } from '../../utils/scoreFormatters';
import { timeScoreSchema, pointsScoreSchema, ScoreRecord } from '../types';

export function useScoreSubmission(
  eventId: string | null,
  modalityId: number,
  athlete: {
    atleta_id: string;
    equipe_id?: number;
  },
  judgeId: string,
  scoreType: 'tempo' | 'distancia' | 'pontos'
) {
  const queryClient = useQueryClient();
  
  // Calculate positions after score submission
  const calculatePositions = async () => {
    if (!eventId || !modalityId) return;
    
    // Get all scores for this modality
    const { data: allScores, error } = await supabase
      .from('pontuacoes')
      .select('*')
      .eq('evento_id', eventId)
      .eq('modalidade_id', modalityId);
    
    if (error || !allScores) {
      console.error('Error calculating positions:', error);
      return;
    }
    
    // Sort based on score type
    let sortedScores = [...allScores] as ScoreRecord[];
    
    if (scoreType === 'tempo') {
      // For time, lower is better (ascending)
      sortedScores.sort((a, b) => {
        const aTotal = parseTimeToMilliseconds(
          a.tempo_minutos || 0,
          a.tempo_segundos || 0,
          a.tempo_milissegundos || 0
        );
        
        const bTotal = parseTimeToMilliseconds(
          b.tempo_minutos || 0,
          b.tempo_segundos || 0,
          b.tempo_milissegundos || 0
        );
        
        return aTotal - bTotal;
      });
    } else {
      // For points and distance, higher is better (descending)
      sortedScores.sort((a, b) => (b.valor_pontuacao || 0) - (a.valor_pontuacao || 0));
    }
    
    // Update positions and medals for each score
    for (let i = 0; i < sortedScores.length; i++) {
      const position = i + 1;
      const medal = formatMedal(position);
      
      await supabase
        .from('pontuacoes')
        .update({
          posicao_final: position,
          medalha: medal,
        })
        .eq('id', sortedScores[i].id);
    }
  };

  // Format medal based on position
  const formatMedal = (position: number | null): string | null => {
    if (!position) return null;
    
    switch (position) {
      case 1:
        return 'ouro';
      case 2:
        return 'prata';
      case 3:
        return 'bronze';
      default:
        return null;
    }
  };

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (data: z.infer<typeof timeScoreSchema> | z.infer<typeof pointsScoreSchema>) => {
      if (!eventId) throw new Error('Event ID is missing');
      
      // Convert data based on score type
      let scoreData;
      
      if (scoreType === 'tempo' && 'minutes' in data) {
        const minutes = data.minutes;
        const seconds = data.seconds;
        const milliseconds = data.milliseconds;
        
        scoreData = {
          tempo_minutos: minutes,
          tempo_segundos: seconds,
          tempo_milissegundos: milliseconds,
          // Calculate total milliseconds for easier sorting
          valor_pontuacao: parseTimeToMilliseconds(minutes, seconds, milliseconds),
          unidade: 'ms'
        };
      } else if ('score' in data) {
        const score = data.score;
        scoreData = {
          valor_pontuacao: score,
          tempo_minutos: null,
          tempo_segundos: null,
          tempo_milissegundos: null,
          unidade: scoreType === 'distancia' ? 'm' : 'pontos'
        };
      } else {
        throw new Error('Invalid form data format');
      }
      
      const commonFields = {
        observacoes: data.notes || null,
        juiz_id: judgeId,
        data_registro: new Date().toISOString()
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
        await supabase
          .from('pontuacoes')
          .update({
            ...scoreData,
            ...commonFields
          })
          .eq('id', existingScore.id);
      } else {
        // Insert new score
        await supabase
          .from('pontuacoes')
          .insert({
            evento_id: eventId,
            modalidade_id: modalityId,
            atleta_id: athlete.atleta_id,
            ...scoreData,
            ...commonFields
          });
      }
      
      // If this athlete is part of a team, we need to retrieve team members
      if (athlete.equipe_id) {
        const { data: teamMembers } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            atleta_id
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('equipe_id', athlete.equipe_id);
        
        // Update scores for all team members with the same score
        if (teamMembers && teamMembers.length > 0) {
          for (const member of teamMembers) {
            if (member.atleta_id !== athlete.atleta_id) {
              // Check if score exists for team member
              const { data: memberScore } = await supabase
                .from('pontuacoes')
                .select('id')
                .eq('evento_id', eventId)
                .eq('modalidade_id', modalityId)
                .eq('atleta_id', member.atleta_id)
                .maybeSingle();
              
              if (memberScore) {
                // Update existing score
                await supabase
                  .from('pontuacoes')
                  .update({
                    ...scoreData,
                    ...commonFields,
                    juiz_id: judgeId,
                    data_registro: new Date().toISOString()
                  })
                  .eq('id', memberScore.id);
              } else {
                // Insert new score
                await supabase
                  .from('pontuacoes')
                  .insert({
                    evento_id: eventId,
                    modalidade_id: modalityId,
                    atleta_id: member.atleta_id,
                    ...scoreData,
                    ...commonFields,
                    juiz_id: judgeId,
                    data_registro: new Date().toISOString()
                  });
              }
            }
          }
        }
      }
      
      // Calculate positions after saving scores
      await calculatePositions();
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['score', athlete.atleta_id, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['athletes', modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['modality-rankings', modalityId, eventId] });
      toast.success("Pontuação registrada com sucesso");
    },
    onError: (error) => {
      console.error('Error submitting score:', error);
      toast.error("Não foi possível registrar a pontuação");
    }
  });

  return { submitScoreMutation };
}
