
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
