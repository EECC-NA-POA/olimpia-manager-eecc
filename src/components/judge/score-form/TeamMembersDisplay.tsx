
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
}

interface TeamMembersDisplayProps {
  modalityId: number;
  athleteId: string;
  eventId: string | null;
  isTeamModality: boolean;
}

export function TeamMembersDisplay({ modalityId, athleteId, eventId, isTeamModality }: TeamMembersDisplayProps) {
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', modalityId, athleteId, eventId],
    queryFn: async () => {
      if (!modalityId || !athleteId || !eventId || !isTeamModality) {
        return [];
      }
      
      try {
        // Find the team for the current athlete in this modality and event context.
        const { data: teamEnrollment, error: teamEnrollmentError } = await supabase
          .from('atletas_equipes')
          .select('equipes!inner(id, modalidade_id, evento_id)')
          .eq('atleta_id', athleteId)
          .eq('equipes.modalidade_id', modalityId)
          .eq('equipes.evento_id', eventId)
          .single();

        if (teamEnrollmentError || !teamEnrollment) {
          console.error('Error or no team found for athlete in this context:', teamEnrollmentError);
          return [];
        }

        const teamId = teamEnrollment.equipes.id;
        
        // Then get all athletes in that team
        const { data: members, error: membersError } = await supabase
          .from('atletas_equipes')
          .select(`
            atleta_id,
            usuarios:atleta_id(nome_completo)
          `)
          .eq('equipe_id', teamId);
        
        if (membersError) {
          console.error('Error fetching team members:', membersError);
          return [];
        }
        
        return members.map((member: any) => ({
          id: member.atleta_id,
          name: member.usuarios?.nome_completo || 'Atleta',
        })) as TeamMember[];
      } catch (error) {
        console.error('Error in team members query:', error);
        return [];
      }
    },
    enabled: !!modalityId && !!athleteId && !!eventId && isTeamModality,
  });

  if (!isTeamModality || !teamMembers || teamMembers.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/50 p-3 rounded-md mb-4">
      <p className="text-sm font-medium mb-2">Membros da equipe ({teamMembers.length})</p>
      <div className="flex flex-wrap gap-2">
        {teamMembers.map(member => (
          <Badge key={member.id} variant="outline" className="bg-white">
            {member.name}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        A pontuação será registrada para todos os membros da equipe.
      </p>
    </div>
  );
}
