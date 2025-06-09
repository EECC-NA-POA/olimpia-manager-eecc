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

  // Fetch athletes enrolled in the modality
  const { data: enrolledAthletes = [] } = useQuery({
    queryKey: ['enrolled-athletes', modalityId, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios(nome_completo)
        `)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId);

      if (error) throw error;
      
      return data.map(item => {
        // Handle both single object and array responses from Supabase
        const user = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        return {
          atleta_id: item.atleta_id,
          nome: user?.nome_completo || 'Atleta'
        };
      });
    },
    enabled: !!modalityId && !!eventId
  });

  // Fetch participation status
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
      if (error) throw error;
      return data || [];
    },
    enabled: !!modalityId && !!eventId
  });

  // Fetch required fields completion status
  const { data: scoresData = [] } = useQuery({
    queryKey: ['athletes-scores-completion', modalityId, eventId, bateriaId, modeloId],
    queryFn: async () => {
      let query = supabase
        .from('pontuacoes')
        .select(`
          atleta_id,
          tentativas_pontuacao(
            chave_campo,
            valor
          )
        `)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('modelo_id', modeloId);

      if (bateriaId) {
        query = query.eq('bateria_id', bateriaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!modalityId && !!eventId && !!modeloId
  });

  // Get required fields from the model
  const { data: requiredFields = [] } = useQuery({
    queryKey: ['required-fields', modeloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('chave_campo')
        .eq('modelo_id', modeloId)
        .eq('obrigatorio', true)
        .neq('tipo_input', 'calculated'); // Exclude calculated fields

      if (error) throw error;
      return data.map(field => field.chave_campo);
    },
    enabled: !!modeloId
  });

  // Toggle participation mutation
  const toggleParticipationMutation = useMutation({
    mutationFn: async ({ athleteId, participating }: { athleteId: string; participating: boolean }) => {
      const participationRecord = {
        atleta_id: athleteId,
        modalidade_id: modalityId,
        evento_id: eventId,
        bateria_id: bateriaId || null,
        participando: participating
      };

      const { data: existing } = await supabase
        .from('participacao_atletas')
        .select('id')
        .eq('atleta_id', athleteId)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('bateria_id', bateriaId || null)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('participacao_atletas')
          .update({ participando: participating })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('participacao_atletas')
          .insert([participationRecord]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-participation'] });
    },
    onError: (error) => {
      console.error('Error updating participation:', error);
      toast.error('Erro ao atualizar participação do atleta');
    }
  });

  // Combine all data
  const athletesWithParticipation: AthleteWithParticipation[] = enrolledAthletes.map(athlete => {
    const participation = participationData.find(p => p.atleta_id === athlete.atleta_id);
    const scoreData = scoresData.find(s => s.atleta_id === athlete.atleta_id);
    
    // Check if athlete has all required fields completed
    const completedFields = scoreData?.tentativas_pontuacao?.map((t: any) => t.chave_campo) || [];
    const hasRequiredFields = requiredFields.every(field => 
      completedFields.includes(field) && 
      scoreData?.tentativas_pontuacao?.find((t: any) => 
        t.chave_campo === field && t.valor !== null && t.valor !== ''
      )
    );

    return {
      atleta_id: athlete.atleta_id,
      nome: athlete.nome,
      participando: participation?.participando ?? true, // Default to participating
      hasRequiredFields
    };
  });

  const getParticipatingAthletes = () => {
    return athletesWithParticipation.filter(athlete => athlete.participando);
  };

  const allRequiredFieldsCompleted = athletesWithParticipation
    .filter(athlete => athlete.participando)
    .every(athlete => athlete.hasRequiredFields);

  const toggleAthleteParticipation = (athleteId: string, participating: boolean) => {
    toggleParticipationMutation.mutate({ athleteId, participating });
  };

  return {
    athletesWithParticipation,
    toggleAthleteParticipation,
    getParticipatingAthletes,
    allRequiredFieldsCompleted,
    isLoadingParticipation
  };
}
