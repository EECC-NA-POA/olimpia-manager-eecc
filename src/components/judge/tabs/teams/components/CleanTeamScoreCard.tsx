
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTeamScoring } from '../hooks/useTeamScoring';
import { CleanTeamScoringForm } from './CleanTeamScoringForm';

interface TeamMember {
  atleta_id: string;
  atleta_nome: string;
  numero_identificador?: string;
}

interface Team {
  equipe_id: number;
  equipe_nome: string;
  modalidade_id: number;
  modalidade_nome: string;
  members: TeamMember[];
}

interface CleanTeamScoreCardProps {
  team: Team;
  eventId: string;
  judgeId: string;
}

export function CleanTeamScoreCard({ team, eventId, judgeId }: CleanTeamScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { submitTeamScore, isSubmitting } = useTeamScoring({ eventId, judgeId });

  // Get modality details and scoring model
  const { data: modalityDetails, isLoading: isLoadingModality } = useQuery({
    queryKey: ['clean-modality-details', team.modalidade_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modalidades')
        .select(`
          id,
          nome,
          tipo_pontuacao,
          categoria,
          modelos_modalidade (
            id,
            codigo_modelo,
            descricao
          )
        `)
        .eq('id', team.modalidade_id)
        .single();

      if (error) {
        console.error('Error fetching modality details:', error);
        throw error;
      }

      return data;
    },
    enabled: !!team.modalidade_id,
  });

  // Check for existing team score
  const { data: existingScore, refetch: refetchScore } = useQuery({
    queryKey: ['clean-team-score', team.equipe_id, team.modalidade_id, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('evento_id', eventId)
        .eq('modalidade_id', team.modalidade_id)
        .eq('equipe_id', team.equipe_id)
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching existing team score:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!eventId && !!team.equipe_id,
  });

  const modelo = modalityDetails?.modelos_modalidade?.[0];

  const handleSubmit = async (formData: any) => {
    if (!modelo || team.members.length === 0) {
      return;
    }

    const representativeAthlete = team.members[0];

    try {
      await submitTeamScore({
        teamId: team.equipe_id,
        modalityId: team.modalidade_id,
        modeloId: modelo.id,
        athleteId: representativeAthlete.atleta_id,
        formData
      });

      setIsExpanded(false);
      await refetchScore();
    } catch (error) {
      console.error('Error submitting team score:', error);
    }
  };

  if (team.members.length === 0) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {team.equipe_nome}
            <Badge variant="outline">Equipe Vazia</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Esta equipe não possui membros
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={existingScore ? 'border-green-300 bg-green-50' : ''}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {team.equipe_nome}
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {team.modalidade_nome}
          </Badge>
          {existingScore && (
            <Badge variant="outline" className="bg-green-100 text-green-700">
              Pontuada
            </Badge>
          )}
        </CardTitle>
        <div className="mt-2">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Membros ({team.members.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {team.members.map((member) => (
              <Badge key={member.atleta_id} variant="outline" className="text-xs">
                {member.atleta_nome}
                {member.numero_identificador && ` (${member.numero_identificador})`}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {existingScore && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
            <div className="text-green-800 text-sm font-medium">
              ✓ Pontuação registrada: {existingScore.valor_pontuacao} {existingScore.unidade}
            </div>
            {existingScore.observacoes && (
              <div className="text-green-700 text-xs mt-1">
                Observações: {existingScore.observacoes}
              </div>
            )}
          </div>
        )}

        <Button
          variant={isExpanded ? "outline" : "default"}
          size="sm"
          className="w-full mb-3"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isLoadingModality || !modelo}
        >
          {isLoadingModality 
            ? "Carregando..." 
            : isExpanded 
              ? "Fechar formulário" 
              : "Pontuar equipe"
          }
        </Button>

        {isExpanded && modelo && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Pontuação de equipe:</strong> A pontuação será registrada para todos os {team.members.length} membros da equipe automaticamente.
              </p>
            </div>
            
            <CleanTeamScoringForm
              modeloId={modelo.id}
              modalityId={team.modalidade_id}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialValues={existingScore?.dados_pontuacao || {}}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
