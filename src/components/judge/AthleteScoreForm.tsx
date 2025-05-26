
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ScoreForm } from './score-card/components/ScoreForm';
import { useScoreSubmission } from './score-card/hooks/useScoreSubmission';
import { ModalityRankings } from './ModalityRankings';
import { ScoreRecord, Modality } from '@/lib/types/database';

interface AthleteScoreFormProps {
  athleteId: string;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
}

interface TeamMember {
  id: string;
  name: string;
}

export function AthleteScoreForm({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId 
}: AthleteScoreFormProps) {
  // Get modality details to determine score type
  const { data: modality } = useQuery({
    queryKey: ['modality-details', modalityId],
    queryFn: async () => {
      if (!modalityId) return null;
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, tipo_pontuacao, tipo_modalidade')
        .eq('id', modalityId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching modality details:', error);
        toast.error('Erro ao carregar detalhes da modalidade');
        return null;
      }
      
      return {
        modalidade_id: data?.id,
        modalidade_nome: data?.nome,
        tipo_pontuacao: data?.tipo_pontuacao || 'points',
        tipo_modalidade: data?.tipo_modalidade
      } as Modality;
    },
    enabled: !!modalityId,
  });

  // Get team members if modality is team-based
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members', modalityId, athleteId, eventId],
    queryFn: async () => {
      if (!modalityId || !athleteId || !eventId || !modality?.tipo_modalidade?.includes('COLETIVA')) {
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
    enabled: !!modalityId && !!athleteId && !!eventId && !!modality?.tipo_modalidade?.includes('COLETIVA'),
  });
  
  const isTeamModality = modality?.tipo_modalidade?.includes('COLETIVA');
  const scoreType = modality?.tipo_pontuacao as 'tempo' | 'distancia' | 'pontos' || 'pontos';
  
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

  if (!modality) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-center text-muted-foreground">Carregando detalhes da modalidade...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registrar {isTeamModality ? 'Pontuação da Equipe' : 'Pontuação'}</CardTitle>
              <CardDescription>
                Modalidade: {modality.modalidade_nome}
                {isTeamModality && (
                  <span className="ml-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Coletiva
                    </Badge>
                  </span>
                )}
              </CardDescription>
            </div>
            <div>
              <Badge 
                variant="secondary"
                className="ml-2 capitalize"
              >
                {scoreType === 'tempo' && 'Tempo'}
                {scoreType === 'distancia' && 'Distância'}
                {scoreType === 'pontos' && 'Pontos'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isTeamModality && teamMembers && teamMembers.length > 0 && (
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
          )}
          
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
        scoreType={scoreType}
      />
    </div>
  );
}
