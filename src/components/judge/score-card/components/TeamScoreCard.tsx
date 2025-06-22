
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

  // Fetch comprehensive modality details including the scoring model
  const { data: modalityDetails, isLoading: isLoadingModality } = useQuery({
    queryKey: ['modality-details-complete', modalityId],
    queryFn: async () => {
      console.log('Fetching modality details for ID:', modalityId);
      
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
        .eq('id', modalityId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching modality details:', error);
        throw new Error('Erro ao buscar detalhes da modalidade');
      }
      
      console.log('Modality details fetched:', data);
      return data;
    },
    enabled: !!modalityId,
  });

  const modelo = modalityDetails?.modelos_modalidade?.[0];
  const modeloId = modelo?.id;
  const tipoPontuacao = modalityDetails?.tipo_pontuacao || scoreType;
  const modalidadeCategoria = modalityDetails?.categoria || null;

  console.log('TeamScoreCard - Modality details:', {
    modalityId,
    modeloId,
    tipoPontuacao,
    modalidadeCategoria,
    modalityDetails
  });

  const { data: existingScore, refetch: refetchScore } = useQuery({
    queryKey: ['team-score', team.equipe_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      // Query specifically for team scores - look for any team member's score
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

  // Updated medal info query to handle team medals correctly
  const { data: medalInfo } = useQuery({
    queryKey: ['team-medal', team.equipe_id, modalityId, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      // Skip team medal display until the database structure is clarified
      console.log('Team medal info query skipped - equipe_id column not available in premiacoes table');
      return null;
    },
    enabled: false, // Disable this query for now
  });

  useEffect(() => {
    if (existingScore) setIsExpanded(true);
  }, [existingScore]);

  const handleDynamicSuccess = () => {
    setIsExpanded(false);
    refetchScore();
  };

  const getCategoryDisplayName = (categoria: string | null) => {
    if (!categoria) return null;
    
    const categoryMap: { [key: string]: string } = {
      'masculino': 'Masculino',
      'feminino': 'Feminino',
      'misto': 'Misto',
    };
    
    return categoryMap[categoria.toLowerCase()] || categoria;
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
              {modalidadeCategoria && (
                <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200">
                  {getCategoryDisplayName(modalidadeCategoria)}
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
            
            {modeloId ? (
              <DynamicScoreForm
                modeloId={modeloId}
                modalityId={modalityId}
                athleteId={representativeAthlete.atleta_id}
                equipeId={team.equipe_id}
                eventId={eventId!}
                judgeId={judgeId}
                initialValues={existingScore?.dados_pontuacao || {}}
                onSuccess={handleDynamicSuccess}
              />
            ) : (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Modelo de Pontuação Ausente</AlertTitle>
                <AlertDescription>
                  Esta modalidade de equipe não possui um modelo de pontuação dinâmico configurado. O registro de pontuação para equipes só é possível com um modelo dinâmico. Por favor, contate o organizador.
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

  const getCategoryDisplayName = (categoria: string | null) => {
    if (!categoria) return null;
    
    const categoryMap: { [key: string]: string } = {
      'masculino': 'Masculino',
      'feminino': 'Feminino',
      'misto': 'Misto',
    };
    
    return categoryMap[categoria.toLowerCase()] || categoria;
  };

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
                {getCategoryDisplayName(category)}
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
