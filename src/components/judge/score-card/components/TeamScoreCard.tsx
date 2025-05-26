
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MedalDisplay } from './MedalDisplay';
import { ScoreForm } from './ScoreForm';
import { useScoreSubmission } from '../hooks/useScoreSubmission';
import { ScoreRecord } from '../types';

interface TeamMember {
  atleta_id: string;
  atleta_nome: string;
  numero_identificador?: string;
}

interface TeamScoreCardProps {
  team: {
    equipe_id: number;
    equipe_nome: string;
    members: TeamMember[];
  };
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function TeamScoreCard({ 
  team, 
  modalityId, 
  eventId, 
  judgeId,
  scoreType
}: TeamScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use the first team member as representative for the team score
  const representativeAthlete = team.members[0];
  
  const { submitScoreMutation } = useScoreSubmission(
    eventId, 
    modalityId, 
    { atleta_id: representativeAthlete?.atleta_id, equipe_id: team.equipe_id }, 
    judgeId, 
    scoreType
  );

  // Fetch existing score if it exists (check for any team member's score)
  const { data: existingScore } = useQuery({
    queryKey: ['team-score', team.equipe_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !representativeAthlete) return null;
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('equipe_id', team.equipe_id)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching existing team score:', error);
        return null;
      }
      
      return data as ScoreRecord;
    },
    enabled: !!eventId && !!representativeAthlete && !!team.equipe_id,
  });

  // Fetch medal info from premiacoes (check team's position)
  const { data: medalInfo } = useQuery({
    queryKey: ['team-medal', team.equipe_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !representativeAthlete) return null;
      
      const { data, error } = await supabase
        .from('premiacoes')
        .select('posicao, medalha')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('equipe_id', team.equipe_id)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching team medal info:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!eventId && !!representativeAthlete && !!team.equipe_id,
  });

  // Expand form when score exists
  useEffect(() => {
    if (existingScore) {
      setIsExpanded(true);
    }
  }, [existingScore]);

  // Handle form submission
  const handleSubmit = (data: any) => {
    submitScoreMutation.mutate(data, {
      onSuccess: () => setIsExpanded(false)
    });
  };

  if (!representativeAthlete) {
    return (
      <Card className="opacity-50">
        <CardContent className="py-4">
          <p className="text-center text-muted-foreground">Equipe sem membros</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`
      overflow-hidden transition-all duration-200
      ${existingScore ? 'border-blue-300 shadow-blue-100' : ''}
    `}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {team.equipe_nome}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Equipe
              </Badge>
            </CardTitle>
            <div className="mt-2">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Membros ({team.members.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {team.members.map((member, index) => (
                  <Badge key={member.atleta_id} variant="outline" className="text-xs">
                    {member.atleta_nome}
                    {member.numero_identificador && ` (${member.numero_identificador})`}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <MedalDisplay 
            scoreRecord={existingScore || null} 
            medalInfo={medalInfo || null}
            scoreType={scoreType} 
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button 
          variant={isExpanded ? "outline" : "default"}
          size="sm" 
          className="w-full my-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Esconder formulário" : "Registrar pontuação da equipe"}
        </Button>

        {isExpanded && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Pontuação de equipe:</strong> A pontuação será registrada para todos os membros da equipe automaticamente.
              </p>
            </div>
            
            <ScoreForm 
              modalityId={modalityId}
              initialValues={existingScore}
              onSubmit={handleSubmit}
              isPending={submitScoreMutation.isPending}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
