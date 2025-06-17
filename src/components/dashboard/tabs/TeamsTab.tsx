
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllTeamsData } from '@/components/judge/tabs/teams/hooks/useAllTeamsData';
import { JudgeTeamsScoringTab } from '@/components/judge/tabs/teams/components/JudgeTeamsScoringTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamManager } from '@/components/judge/tabs/teams/hooks/useTeamManager';
import { TeamsTabHeader } from '@/components/judge/tabs/teams/components/TeamsTabHeader';
import { ManageTeamsTab } from '@/components/judge/tabs/teams/components/ManageTeamsTab';
import { ViewAllTeamsTab } from '@/components/judge/tabs/teams/components/ViewAllTeamsTab';

interface TeamsTabProps {
  eventId: string | null;
  branchId?: string;
}

export function TeamsTab({ eventId, branchId }: TeamsTabProps) {
  const { user } = useAuth();

  // Define se o usuário é representante de delegação APENAS
  const isDelegationRepOnly = user?.papeis?.some(role => role.codigo === 'RDD')
  && !user?.papeis?.some(role => role.codigo === 'ORE');

  // Filtros e estados para visualização dos times
  const [modalityFilter, setModalityFilter] = useState<number | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de equipes/modalidades/filiais (para pontuação de juiz)
  const {
    teams: allTeams,
    modalities: allModalities,
    branches,
    isLoading: isLoadingAllTeams,
    error: allTeamsError,
  } = useAllTeamsData(
    eventId,
    modalityFilter,
    branchFilter,
    searchTerm,
    user?.filial_id // Representante de delegação vê apenas suas equipes
  );

  // Agrupa equipes por modalidade, mesmo as sem atletas (MOSTRAR TODAS!)
  const transformedTeams = allTeams?.map(team => ({
    equipe_id: team.id,
    equipe_nome: team.nome,
    modalidade_id: team.modalidade_id,
    modalidade_nome: team.modalidade_info?.nome || '',
    tipo_pontuacao: (team.modalidade_info as any)?.tipo_pontuacao || 'pontos',
    categoria: (team.modalidade_info as any)?.categoria || '',
    filial_nome: team.filial_id || '',
    members: Array.isArray(team.atletas)
      ? team.atletas.map(athlete => ({
          atleta_id: athlete.atleta_id,
          atleta_nome: athlete.atleta_nome || '',
          numero_identificador: athlete.numero_identificador || ''
        }))
      : []
  })) || [];

  const transformedModalities = allModalities?.map(modality => ({
    modalidade_id: modality.id,
    modalidade_nome: modality.nome
  })) || [];

  // Para representantes de delegação, mostrar apenas a aba "Gerenciar Equipes" (sem pontuação)
  if (isDelegationRepOnly) {
    const {
      modalities,
      teams,
      availableAthletes,
      selectedModalityId,
      setSelectedModalityId,
      isLoading,
      createTeam,
      deleteTeam,
      addAthlete,
      removeAthlete,
      updateAthletePosition,
      isCreatingTeam,
      isDeletingTeam,
      isAddingAthlete,
      isRemovingAthlete,
      isUpdatingAthlete,
      teamToDelete,
      isDeleteDialogOpen,
      setIsDeleteDialogOpen,
      confirmDeleteTeam,
      cancelDeleteTeam
    } = useTeamManager(eventId, false);

    return (
      <div className="space-y-6">
        <TeamsTabHeader isOrganizer={false}>
          <ManageTeamsTab
            modalities={modalities}
            teams={teams}
            availableAthletes={availableAthletes}
            selectedModalityId={selectedModalityId}
            setSelectedModalityId={setSelectedModalityId}
            isLoading={isLoading}
            createTeam={createTeam}
            deleteTeam={deleteTeam}
            addAthlete={addAthlete}
            removeAthlete={removeAthlete}
            updateAthletePosition={updateAthletePosition}
            isCreatingTeam={isCreatingTeam}
            isDeletingTeam={isDeletingTeam}
            isAddingAthlete={isAddingAthlete}
            isRemovingAthlete={isRemovingAthlete}
            isUpdatingAthlete={isUpdatingAthlete}
            isOrganizer={false}
            teamToDelete={teamToDelete}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            confirmDeleteTeam={confirmDeleteTeam}
            cancelDeleteTeam={cancelDeleteTeam}
          />
        </TeamsTabHeader>
      </div>
    );
  }

  // ORGANIZADOR: gerenciamento completo (caso seja organizador também)
  const {
    modalities,
    teams,
    availableAthletes,
    selectedModalityId,
    setSelectedModalityId,
    isLoading,
    createTeam,
    deleteTeam,
    addAthlete,
    removeAthlete,
    updateAthletePosition,
    isCreatingTeam,
    isDeletingTeam,
    isAddingAthlete,
    isRemovingAthlete,
    isUpdatingAthlete,
    teamToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    confirmDeleteTeam,
    cancelDeleteTeam
  } = useTeamManager(eventId, true);

  return (
    <div className="space-y-6">
      <TeamsTabHeader isOrganizer={true}>
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">
              Gerenciar Equipes
            </TabsTrigger>
            <TabsTrigger value="view-all">
              Visualizar Todas as Equipes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage">
            <ManageTeamsTab
              modalities={modalities}
              teams={teams}
              availableAthletes={availableAthletes}
              selectedModalityId={selectedModalityId}
              setSelectedModalityId={setSelectedModalityId}
              isLoading={isLoading}
              createTeam={createTeam}
              deleteTeam={deleteTeam}
              addAthlete={addAthlete}
              removeAthlete={removeAthlete}
              updateAthletePosition={updateAthletePosition}
              isCreatingTeam={isCreatingTeam}
              isDeletingTeam={isDeletingTeam}
              isAddingAthlete={isAddingAthlete}
              isRemovingAthlete={isRemovingAthlete}
              isUpdatingAthlete={isUpdatingAthlete}
              isOrganizer={true}
              teamToDelete={teamToDelete}
              isDeleteDialogOpen={isDeleteDialogOpen}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              confirmDeleteTeam={confirmDeleteTeam}
              cancelDeleteTeam={cancelDeleteTeam}
            />
          </TabsContent>
          
          <TabsContent value="view-all">
            <ViewAllTeamsTab
              allTeams={transformedTeams}
              allModalities={transformedModalities}
              branches={branches}
              isLoadingAllTeams={isLoadingAllTeams}
              allTeamsError={allTeamsError}
              modalityFilter={modalityFilter}
              branchFilter={branchFilter}
              searchTerm={searchTerm}
              setModalityFilter={setModalityFilter}
              setBranchFilter={setBranchFilter}
              setSearchTerm={setSearchTerm}
              isOrganizer={true}
              eventId={eventId}
              judgeId={user?.id || ''}
            />
          </TabsContent>
        </Tabs>
      </TeamsTabHeader>
    </div>
  );
}
