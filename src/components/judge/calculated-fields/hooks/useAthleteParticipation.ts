
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AthleteWithParticipation {
  atleta_id: string;
  nome: string;
  participando: boolean;
  hasRequiredFields: boolean;
}

interface UseAthleteParticipationProps {
  modalityId: number;
  eventId: string;
  bateriaId?: number;
  modeloId: number;
}

export function useAthleteParticipation({
  modalityId,
  eventId,
  bateriaId,
  modeloId
}: UseAthleteParticipationProps) {
  const queryClient = useQueryClient();

  // Fetch athletes with scores
  const { data: athletesWithScores = [], isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes-with-scores', modalityId, eventId, bateriaId],
    queryFn: async () => {
      console.log('Fetching athletes with scores:', { modalityId, eventId, bateriaId });
      
      let query = supabase
        .from('pontuacoes')
        .select(`
          atleta_id,
          usuarios!pontuacoes_atleta_id_fkey(nome_completo),
          tentativas_pontuacao(chave_campo, valor)
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('modelo_id', modeloId);

      if (bateriaId) {
        query = query.eq('bateria_id', bateriaId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching athletes with scores:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!eventId && !!modalityId && !!modeloId
  });

  // Fetch participation data
  const { data: participationData = [], isLoading: isLoadingParticipation } = useQuery({
    queryKey: ['athlete-participation', modalityId, eventId, bateriaId],
    queryFn: async () => {
      let query = supabase
        .from('participacao_atletas')
        .select('*')
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);

      if (bateriaId) {
        query = query.eq('bateria_id', bateriaId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching participation:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!eventId && !!modalityId
  });

  // Get required fields for validation
  const { data: requiredFields = [] } = useQuery({
    queryKey: ['required-fields', modeloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('chave_campo')
        .eq('modelo_id', modeloId)
        .eq('obrigatorio', true)
        .neq('tipo_input', 'calculated');

      if (error) throw error;
      return data || [];
    },
    enabled: !!modeloId
  });

  const updateParticipationMutation = useMutation({
    mutationFn: async ({ atletaId, participando }: { atletaId: string; participando: boolean }) => {
      console.log('Updating participation:', { atletaId, participando, modalityId, eventId, bateriaId });
      
      const participationData = {
        atleta_id: atletaId,
        modalidade_id: modalityId,
        evento_id: eventId,
        bateria_id: bateriaId || null,
        participando
      };

      const { data, error } = await supabase
        .from('participacao_atletas')
        .upsert(participationData, {
          onConflict: bateriaId 
            ? 'atleta_id,modalidade_id,evento_id,bateria_id'
            : 'atleta_id,modalidade_id,evento_id'
        })
        .select();

      if (error) {
        console.error('Error updating participation:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-participation', modalityId, eventId, bateriaId] 
      });
      toast.success('Participação atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating participation:', error);
      toast.error('Erro ao atualizar participação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  });

  // Process athletes with participation and field completion status
  const athletesWithParticipation: AthleteWithParticipation[] = athletesWithScores.map(athlete => {
    const participation = participationData.find(p => p.atleta_id === athlete.atleta_id);
    
    // Check if athlete has all required fields
    const athleteFields = athlete.tentativas_pontuacao?.map((t: any) => t.chave_campo) || [];
    const hasRequiredFields = requiredFields.every(field => 
      athleteFields.includes(field.chave_campo)
    );

    // Handle the usuarios data properly - it should be a single object due to the specific foreign key reference
    const usuario = athlete.usuarios;
    const nomeCompleto = usuario && typeof usuario === 'object' && 'nome_completo' in usuario 
      ? usuario.nome_completo 
      : 'Atleta';

    return {
      atleta_id: athlete.atleta_id,
      nome: nomeCompleto,
      participando: participation?.participando ?? true, // Default to true if no record
      hasRequiredFields
    };
  });

  const toggleAthleteParticipation = (atletaId: string, participando: boolean) => {
    updateParticipationMutation.mutate({ atletaId, participando });
  };

  const getParticipatingAthletes = () => {
    return athletesWithParticipation.filter(athlete => athlete.participando);
  };

  const allRequiredFieldsCompleted = athletesWithParticipation
    .filter(athlete => athlete.participando)
    .every(athlete => athlete.hasRequiredFields);

  return {
    athletesWithParticipation,
    toggleAthleteParticipation,
    getParticipatingAthletes,
    allRequiredFieldsCompleted,
    isLoadingParticipation: isLoadingAthletes || isLoadingParticipation
  };
}
