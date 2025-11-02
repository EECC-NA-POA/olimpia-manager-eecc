
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CleanTeamScoreCard } from './CleanTeamScoreCard';
import { useTeamScoringData } from '../hooks/useTeamScoringData';
import { Badge } from '@/components/ui/badge';

interface CleanTeamScoringTabProps {
  eventId: string | null;
  judgeId: string;
  modalityFilter?: number | null;
  setModalityFilter: (value: number | null) => void;
  searchTerm?: string;
  setSearchTerm: (value: string) => void;
}

export function CleanTeamScoringTab({
  eventId,
  judgeId,
  modalityFilter,
  setModalityFilter,
  searchTerm = '',
  setSearchTerm
}: CleanTeamScoringTabProps) {
  const { teams, isLoading, error } = useTeamScoringData({
    eventId,
    modalityFilter,
    searchTerm
  });

  // Get available modalities for filter - only collective ones
  const { data: modalities = [] } = useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria')
        .eq('evento_id', eventId)
        .eq('tipo_modalidade', 'coletivo')
        .order('nome');

      if (error) {
        console.error('Error fetching modalities:', error);
        throw error;
      }
      
      console.log('Available collective modalities:', data);
      return data || [];
    },
    enabled: !!eventId,
  });

  // Fetch score counts for team modalities
  const { data: teamScoreCounts } = useQuery({
    queryKey: ['team-score-counts', eventId],
    queryFn: async () => {
      if (!eventId) return {};
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('modalidade_id, equipe_id')
        .eq('evento_id', eventId)
        .not('equipe_id', 'is', null);
      
      if (error) throw error;
      
      // Count unique teams scored per modality
      const counts: Record<number, Set<string>> = {};
      data?.forEach(score => {
        if (!counts[score.modalidade_id]) {
          counts[score.modalidade_id] = new Set();
        }
        counts[score.modalidade_id].add(score.equipe_id);
      });
      
      // Convert sets to counts
      const finalCounts: Record<number, number> = {};
      Object.entries(counts).forEach(([modalityId, teamSet]) => {
        finalCounts[parseInt(modalityId)] = teamSet.size;
      });
      
      return finalCounts;
    },
    enabled: !!eventId,
  });

  if (!eventId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum evento selecionado
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando equipes...
      </div>
    );
  }

  if (error) {
    console.error('Error in CleanTeamScoringTab:', error);
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar equipes: {error.message}
      </div>
    );
  }

  // Group teams by modality and category
  const teamsByModalityCategory = teams.reduce((acc, team) => {
    const key = `${team.modalidade_nome}-${team.modalidade_categoria}`;
    if (!acc[key]) {
      acc[key] = {
        modalidade_nome: team.modalidade_nome,
        modalidade_categoria: team.modalidade_categoria,
        modalidade_id: team.modalidade_id,
        teams: []
      };
    }
    acc[key].teams.push(team);
    return acc;
  }, {} as Record<string, {
    modalidade_nome: string;
    modalidade_categoria: string;
    modalidade_id: number;
    teams: typeof teams;
  }>);

  console.log('Teams data received:', teams);
  console.log('Teams grouped by modality-category:', teamsByModalityCategory);
  console.log('Available modalities for filter:', modalities);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pontuação de Equipes (Limpo)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-64">
              <Select
                value={modalityFilter?.toString() || "all"}
                onValueChange={(value) => setModalityFilter(value === "all" ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  {modalities.map((modality) => (
                    <SelectItem key={modality.id} value={modality.id.toString()}>
                      {modality.nome} - {modality.categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Debug info */}
          <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
            Debug: {teams.length} equipes encontradas, {Object.keys(teamsByModalityCategory).length} grupos de modalidade-categoria
          </div>

          {/* Teams grouped by modality and category */}
          {Object.keys(teamsByModalityCategory).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma equipe encontrada</p>
              <p className="text-sm mt-1">
                {modalityFilter || searchTerm 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Não há equipes de modalidades coletivas disponíveis para este evento'
                }
              </p>
              {modalities.length === 0 && (
                <p className="text-sm mt-1 text-orange-600">
                  Nenhuma modalidade coletiva encontrada no evento
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(teamsByModalityCategory).map(([key, modalityGroup]) => (
                <div key={key} className="space-y-4">
                  {/* Modality Header */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-olimpics-green-primary" />
                          <span>{modalityGroup.modalidade_nome}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {modalityGroup.modalidade_categoria}
                          </Badge>
                          <Badge variant="outline">
                            {modalityGroup.teams.length} equipe{modalityGroup.teams.length !== 1 ? 's' : ''}
                          </Badge>
                          {teamScoreCounts && teamScoreCounts[modalityGroup.modalidade_id] > 0 && (
                            <Badge variant="default" className="bg-green-600">
                              {teamScoreCounts[modalityGroup.modalidade_id]} pontuad{teamScoreCounts[modalityGroup.modalidade_id] === 1 ? 'a' : 'as'}
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  {/* Teams in this modality-category */}
                  <div className="grid gap-4">
                    {modalityGroup.teams.map((team) => (
                      <CleanTeamScoreCard
                        key={team.equipe_id}
                        team={team}
                        eventId={eventId}
                        judgeId={judgeId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
