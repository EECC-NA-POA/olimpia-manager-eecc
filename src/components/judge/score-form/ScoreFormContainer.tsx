
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreForm } from '../score-card/components/ScoreForm';
import { useScoreSubmission } from '../score-card/hooks/useScoreSubmission';
import { ModalityRankings } from '../ModalityRankings';
import { ModalityHeader } from './ModalityHeader';
import { TeamMembersDisplay } from './TeamMembersDisplay';
import { useModalityRules } from '../tabs/scores/hooks/useModeloConfiguration';
import { ScoreRecord, Modality } from '@/lib/types/database';

interface ScoreFormContainerProps {
  athleteId: string;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  modality: Modality;
}

export function ScoreFormContainer({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId,
  modality
}: ScoreFormContainerProps) {
  const isTeamModality = modality?.tipo_modalidade?.includes('COLETIVA');
  
  // Fetch modality rules to determine scoring logic
  const { data: modalityRule } = useModalityRules(modalityId);
  
  // Map English score types to Portuguese for the submission hook
  const mapScoreTypeToEnglish = (portugueseType: string): 'time' | 'distance' | 'points' => {
    switch (portugueseType) {
      case 'tempo':
        return 'time';
      case 'distancia':
        return 'distance';
      case 'pontos':
      default:
        return 'points';
    }
  };
  
  const scoreType = modality?.tipo_pontuacao || 'pontos';
  const mappedScoreType = mapScoreTypeToEnglish(scoreType);
  
  // Fetch existing score if it exists
  const { data: existingScore } = useQuery({
    queryKey: ['score', athleteId, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athleteId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching existing score:', error);
        return null;
      }
      
      return data as ScoreRecord;
    },
    enabled: !!eventId && !!athleteId && !!modalityId,
  });

  // Get team members if modality is team-based
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', modalityId, athleteId, eventId],
    queryFn: async () => {
      if (!modalityId || !athleteId || !eventId || !isTeamModality) {
        return [];
      }
      
      try {
        // First get the team ID for this athlete in this modality
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('inscricoes_modalidades')
          .select('equipe_id')
          .eq('modalidade_id', modalityId)
          .eq('atleta_id', athleteId)
          .eq('evento_id', eventId)
          .maybeSingle();
        
        if (enrollmentError || !enrollment?.equipe_id) {
          console.error('Error fetching team:', enrollmentError);
          return [];
        }
        
        // Then get all athletes in that team
        const { data: members, error: membersError } = await supabase
          .from('inscricoes_modalidades')
          .select(`
            atleta_id,
            usuarios:atleta_id(nome_completo)
          `)
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .eq('equipe_id', enrollment.equipe_id);
        
        if (membersError) {
          console.error('Error fetching team members:', membersError);
          return [];
        }
        
        return members.map((member: any) => ({
          id: member.atleta_id,
          name: member.usuarios?.nome_completo || 'Atleta',
        }));
      } catch (error) {
        console.error('Error in team members query:', error);
        return [];
      }
    },
    enabled: !!modalityId && !!athleteId && !!eventId && isTeamModality,
  });

  const { submitScoreMutation } = useScoreSubmission(
    eventId, 
    modalityId, 
    { atleta_id: athleteId, equipe_id: teamMembers?.[0] ? teamMembers.find(m => m.id === athleteId) ? undefined : teamMembers[0] ? undefined : undefined : undefined }, 
    judgeId, 
    scoreType
  );

  // Handle form submission
  const handleSubmit = (data: any) => {
    submitScoreMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <ModalityHeader 
          modality={modality}
          isTeamModality={isTeamModality}
          scoreType={scoreType}
        />
        <CardContent>
          <TeamMembersDisplay 
            modalityId={modalityId}
            athleteId={athleteId}
            eventId={eventId}
            isTeamModality={isTeamModality}
          />
          
          <ScoreForm 
            modalityId={modalityId}
            initialValues={existingScore}
            onSubmit={handleSubmit}
            isPending={submitScoreMutation.isPending}
          />
        </CardContent>
      </Card>
      
      <ModalityRankings 
        modalityId={modalityId}
        eventId={eventId}
        scoreType={mappedScoreType}
      />
    </div>
  );
}
