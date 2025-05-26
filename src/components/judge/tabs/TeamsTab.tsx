
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamManager } from './teams/hooks/useTeamManager';
import { useAllTeamsData } from './teams/hooks/useAllTeamsData';
import { TeamsTabHeader } from './teams/components/TeamsTabHeader';
import { ManageTeamsTab } from './teams/components/ManageTeamsTab';
import { ViewAllTeamsTab } from './teams/components/ViewAllTeamsTab';
import { NoModalitiesMessage } from './teams/components/NoModalitiesMessage';
import { LoadingTeamsState } from './teams/components/LoadingTeamsState';

interface TeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const { user } = useAuth();
  
  // Check if user has judge role - if yes, they should only see scoring functionality
  const hasJudgeRole = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  
  // Check if user is delegation representative
  const isDelegationRep = user?.papeis?.some(role => role.codigo === 'RDD') || false;
  
  // States for "Visualizar Todas" tab
  const [modalityFilter, setModalityFilter] = useState<number | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
  } = useTeamManager(eventId, isOrganizer);

  // Data for viewing all teams - for organizers and judges, don't filter by branch
  const {
    teams: allTeams,
    modalities: allModalities,
    branches,
    isLoading: isLoadingAllTeams,
    error: allTeamsError
  } = useAllTeamsData(eventId, modalityFilter, branchFilter, searchTerm, (isOrganizer || hasJudgeRole) ? undefined : user?.filial_id);

  if (isLoading && !selectedModalityId) {
    return <LoadingTeamsState />;
  }

  if (!modalities || modalities.length === 0) {
    return <NoModalitiesMessage />;
  }

  // Transform teams data to match expected interface
  const transformedTeams = allTeams?.map(team => {
    return {
      equipe_id: team.id,
      equipe_nome: team.nome,
      modalidade_id: team.modalidade_id,
      modalidade_nome: team.modalidade_info?.nome || '',
      tipo_pontuacao: 'pontos', // Default to 'pontos' since we can't reliably get this from the current data structure
      filial_nome: team.filial_id || '', // Use filial_id since filial_info doesn't exist
      members: team.atletas?.map(athlete => ({
        atleta_id: athlete.atleta_id,
        atleta_nome: athlete.atleta_nome || '',
        numero_identificador: athlete.numero_identificador || ''
      })) || []
    };
  }) || [];

  // Transform modalities data to match expected interface
  const transformedModalities = allModalities?.map(modality => ({
    modalidade_id: modality.id,
    modalidade_nome: modality.nome
  })) || [];

  // If user has judge role, show only the scoring interface
  if (hasJudgeRole) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pontuar Equipes</h2>
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
            isOrganizer={false}
            eventId={eventId}
            isReadOnly={false}
            judgeId={userId}
          />
        </div>
      </div>
    );
  }

  // If user is delegation representative (but not organizer), show only the manage tab
  if (isDelegationRep && !isOrganizer) {
    return (
      <div className="space-y-6">
        <TeamsTabHeader isOrganizer={false}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Gerenciar Minhas Equipes</h2>
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
          </div>
        </TeamsTabHeader>
      </div>
    );
  }

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
