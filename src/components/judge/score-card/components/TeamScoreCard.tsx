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
import { DynamicScoreForm } from './DynamicScoreForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

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
    // categoria: string; <-- No longer direct, pulled from modality info below.
  };
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

function TeamScoreCardContent({
  team,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  representativeAthlete
}: TeamScoreCardProps & { representativeAthlete: TeamMember }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch all required modality details including categoria!
  const { data: modalityDetails, isLoading: isLoadingModality } = useQuery({
    queryKey: ['modality-details', modalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modalidades')
        .select('modelo_modalidade_id, tipo_pontuacao, categoria')
        .eq('id', modalityId)
        .maybeSingle();
      if (error) {
        console.error('Error fetching modality details:', error);
        throw new Error('Erro ao buscar detalhes da modalidade');
      }
      return data;
    },
    enabled: !!modalityId,
  });

  const modeloId = modalityDetails?.modelo_modalidade_id;
  const tipoPontuacao = modalityDetails?.tipo_pontuacao || scoreType; // Prefer tipo from modalidade
  const modalidadeCategoria = modalityDetails?.categoria || null; // New: Fetch modalidade category

  // Team scoring with support for the correct model
  const { submitScoreMutation } = useScoreSubmission(
    eventId,
    modalityId,
    { atleta_id: representativeAthlete?.atleta_id, equipe_id: team.equipe_id },
    judgeId,
    tipoPontuacao
  );

  const { data: existingScore, refetch: refetchScore } = useQuery({
    queryKey: ['team-score', team.equipe_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
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
    enabled: !!eventId && !!team.equipe_id,
  });

  const { data: medalInfo } = useQuery({
    queryKey: ['team-medal', team.equipe_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
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
    enabled: !!eventId && !!team.equipe_id,
  });

  useEffect(() => {
    if (existingScore) setIsExpanded(true);
  }, [existingScore]);

  const handleSubmit = (data: any) => {
    submitScoreMutation.mutate(data, {
      onSuccess: () => setIsExpanded(false),
    });
  };

  const handleDynamicSuccess = () => {
    setIsExpanded(false);
    refetchScore();
  };

  return (
    <Card
      className={`
      overflow-hidden transition-all duration-200
      ${existingScore ? 'border-blue-300 shadow-blue-100' : ''}
    `}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {team.equipe_nome}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Equipe
              </Badge>
              {/* Show category if available */}
              {modalidadeCategoria && (
                <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200">
                  {modalidadeCategoria}
                </Badge>
              )}
            </CardTitle>
            <div className="mt-2">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Membros ({team.members.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {team.members.length > 0 ? (
                  team.members.map((member) => (
                    <Badge key={member.atleta_id} variant="outline" className="text-xs">
                      {member.atleta_nome}
                      {member.numero_identificador && ` (${member.numero_identificador})`}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Equipe sem atletas</span>
                )}
              </div>
            </div>
          </div>
          <MedalDisplay
            scoreRecord={existingScore || null}
            medalInfo={medalInfo || null}
            scoreType={tipoPontuacao}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button
          variant={isExpanded ? "outline" : "default"}
          size="sm"
          className="w-full my-2"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isLoadingModality}
        >
          {isLoadingModality ? "Carregando..." : isExpanded ? "Esconder formulário" : "Registrar pontuação da equipe"}
        </Button>

        {isExpanded && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Pontuação de equipe:</strong> A pontuação será registrada para todos os membros da equipe automaticamente.
              </p>
            </div>
            {!!modeloId ? (
              <DynamicScoreForm
                modeloId={modeloId}
                modalityId={modalityId}
                equipeId={team.equipe_id}
                eventId={eventId!}
                judgeId={judgeId}
                athleteId={representativeAthlete.atleta_id}
                initialValues={existingScore?.dados_pontuacao || {}}
                onSuccess={handleDynamicSuccess}
              />
            ) : tipoPontuacao === 'pontos' || tipoPontuacao === 'tempo' || tipoPontuacao === 'distancia' ? (
              <ScoreForm
                modalityId={modalityId}
                initialValues={existingScore}
                onSubmit={handleSubmit}
                isPending={submitScoreMutation.isPending}
              />
            ) : (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Modelo de Pontuação Ausente</AlertTitle>
                <AlertDescription>
                  Esta modalidade não possui um modelo de pontuação dinâmico configurado. Por favor, contate o organizador.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Show team card even if the team has no members!
export function TeamScoreCard(props: TeamScoreCardProps) {
  const { team, modalityId } = props;
  const representativeAthlete = team.members[0];
  const [category, setCategory] = useState<string | null>(null);

  // Fetch the categoria for display on the empty team UI
  useEffect(() => {
    let ignore = false;
    async function fetchCategory() {
      const { data, error } = await supabase
        .from('modalidades')
        .select('categoria')
        .eq('id', modalityId)
        .maybeSingle();
      if (!ignore && !error && data?.categoria) {
        setCategory(data.categoria);
      }
    }
    // Only fetch if a team exists with no members
    if (!representativeAthlete) {
      fetchCategory();
    }
    return () => { ignore = true; };
  }, [modalityId, representativeAthlete]);

  if (!representativeAthlete) {
    return (
      <Card className="opacity-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {team.equipe_nome}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Equipe
            </Badge>
            {category && (
              <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200">
                {category}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p className="text-center text-muted-foreground">Equipe sem membros</p>
        </CardContent>
      </Card>
    );
  }

  return <TeamScoreCardContent {...props} representativeAthlete={representativeAthlete} />;
}

// FIM DO ARQUIVO
