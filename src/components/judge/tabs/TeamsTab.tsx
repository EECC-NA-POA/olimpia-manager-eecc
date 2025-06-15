
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllTeamsData } from './teams/hooks/useAllTeamsData';
import { JudgeTeamsScoringTab } from './teams/components/JudgeTeamsScoringTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamManager } from './teams/hooks/useTeamManager';
import { TeamsTabHeader } from './teams/components/TeamsTabHeader';
import { ManageTeamsTab } from './teams/components/ManageTeamsTab';
import { ViewAllTeamsTab } from './teams/components/ViewAllTeamsTab';

interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const { user } = useAuth();

  // No painel do juiz, um usuário com papel de juiz (JUZ) só pode pontuar,
  // independentemente de outros papéis que possa ter.
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ');

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
    (isOrganizer || isJudge) ? undefined : user?.filial_id // Juiz e Organizador veem todas as equipes.
  );

  // Transforma os dados para o formato de pontuação
  const transformedTeams = allTeams?.map(team => ({
    equipe_id: team.id,
    equipe_nome: team.nome,
    modalidade_id: team.modalidade_id,
    modalidade_nome: team.modalidade_info?.nome || '',
    tipo_pontuacao: (team.modalidade_info as any)?.tipo_pontuacao || 'pontos',
    categoria: (team.modalidade_info as any)?.categoria,
    filial_nome: team.filial_id || '',
    members: team.atletas?.map(athlete => ({
      atleta_id: athlete.atleta_id,
      atleta_nome: athlete.atleta_nome || '',
      numero_identificador: athlete.numero_identificador || ''
    })) || []
  })) || [];

  const transformedModalities = allModalities?.map(modality => ({
    modalidade_id: modality.id,
    modalidade_nome: modality.nome
  })) || [];

  // Exclusivo para Juiz: Só exibe pontuação de equipes, sem abas nem gerenciamento
  if (!isOrganizer && isJudge) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pontuação de Equipes
            </CardTitle>
            <CardDescription>
              Visualize as equipes das modalidades coletivas e registre apenas as pontuações. Juízes não podem criar, editar ou excluir equipes e atletas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JudgeTeamsScoringTab
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
              eventId={eventId}
              judgeId={userId}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // For delegation representatives only, show only the "Manage Teams" tab (no scoring)
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

  // ORGANIZADOR: gerenciamento completo
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
      <TeamsTabHeader isOrganizer={isOrganizer}>
        <Tabs defaultValue={isOrganizer ? "manage" : "manage"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">
              {isOrganizer ? "Gerenciar Equipes" : "Gerenciar Minhas Equipes"}
            </TabsTrigger>
            <TabsTrigger value="view-all">
              {isOrganizer ? "Visualizar Todas as Equipes" : "Pontuar Equipes"}
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
              isOrganizer={isOrganizer}
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
              isOrganizer={isOrganizer}
              eventId={eventId}
              judgeId={userId}
            />
          </TabsContent>
        </Tabs>
      </TeamsTabHeader>
    </div>
  );
}
