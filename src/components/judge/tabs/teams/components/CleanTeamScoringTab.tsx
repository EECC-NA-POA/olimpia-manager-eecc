
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

  // Get available modalities for filter
  const { data: modalities = [] } = useQuery({
    queryKey: ['team-modalities', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria')
        .eq('tipo_modalidade', 'coletiva')
        .order('nome');

      if (error) throw error;
      return data || [];
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

  console.log('Teams grouped by modality-category:', teamsByModalityCategory);

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

          {/* Teams grouped by modality and category */}
          {Object.keys(teamsByModalityCategory).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma equipe encontrada</p>
              <p className="text-sm mt-1">
                {modalityFilter || searchTerm 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Não há equipes disponíveis para este evento'
                }
              </p>
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
