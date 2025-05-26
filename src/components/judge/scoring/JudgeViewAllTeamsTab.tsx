import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users } from 'lucide-react';
import { LoadingTeamsState } from '../../common/teams/LoadingTeamsState';
import { ErrorState } from '../../common/teams/ErrorState';
import { EmptyState } from '../../common/teams/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AthleteScoreForm } from '../AthleteScoreForm';

interface JudgeViewAllTeamsTabProps {
  allTeams: any[];
  allModalities: any[];
  branches: any[];
  isLoadingAllTeams: boolean;
  allTeamsError: any;
  modalityFilter: number | null;
  branchFilter: string | null;
  searchTerm: string;
  setModalityFilter: (value: number | null) => void;
  setBranchFilter: (value: string | null) => void;
  setSearchTerm: (value: string) => void;
  eventId: string | null;
  judgeId: string;
}

export function JudgeViewAllTeamsTab({
  allTeams,
  allModalities,
  branches,
  isLoadingAllTeams,
  allTeamsError,
  modalityFilter,
  branchFilter,
  searchTerm,
  setModalityFilter,
  setBranchFilter,
  setSearchTerm,
  eventId,
  judgeId
}: JudgeViewAllTeamsTabProps) {
  const [selectedTeam, setSelectedTeam] = React.useState<any>(null);

  // Filter teams based on search and filters
  const filteredTeams = React.useMemo(() => {
    let filtered = allTeams || [];
    
    if (modalityFilter) {
      filtered = filtered.filter(team => team.modalidade_id === modalityFilter);
    }
    
    if (branchFilter) {
      filtered = filtered.filter(team => team.filial_nome === branchFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(team => 
        team.equipe_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.members.some((member: any) => 
          member.atleta_nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    return filtered;
  }, [allTeams, modalityFilter, branchFilter, searchTerm]);

  if (isLoadingAllTeams) {
    return <LoadingTeamsState />;
  }

  if (allTeamsError) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  if (selectedTeam) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedTeam(null)}
          className="mb-4"
        >
          ← Voltar para Lista de Equipes
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedTeam.equipe_nome} - {selectedTeam.modalidade_nome}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTeam.members.map((member: any) => (
                <div key={member.atleta_id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{member.atleta_nome}</h4>
                  <AthleteScoreForm
                    athleteId={member.atleta_id}
                    modalityId={selectedTeam.modalidade_id}
                    eventId={eventId}
                    judgeId={judgeId}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar por nome</label>
              <Input
                placeholder="Nome da equipe ou atleta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Modalidade</label>
              <Select value={modalityFilter?.toString() || ""} onValueChange={(value) => setModalityFilter(value ? parseInt(value) : null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as modalidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as modalidades</SelectItem>
                  {allModalities.map((modality) => (
                    <SelectItem key={modality.modalidade_id} value={modality.modalidade_id.toString()}>
                      {modality.modalidade_nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filial</label>
              <Select value={branchFilter || ""} onValueChange={(value) => setBranchFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as filiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as filiais</SelectItem>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.nome}>
                      {branch.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <EmptyState 
          title="Nenhuma equipe encontrada" 
          description="Não há equipes que correspondam aos filtros aplicados" 
        />
      ) : (
        <div className="grid gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.equipe_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{team.equipe_nome}</h3>
                      <Badge variant="secondary">{team.modalidade_nome}</Badge>
                      <Badge variant="outline">{team.filial_nome}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Membros ({team.members.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member: any) => (
                          <Badge key={member.atleta_id} variant="outline" className="text-xs">
                            {member.atleta_nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setSelectedTeam(team)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Pontuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
