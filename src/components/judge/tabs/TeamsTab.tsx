
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

// Define the Team interface expected by ViewAllTeamsTab
interface Team {
  equipe_id: number;
  equipe_nome: string;
  modalidade_id: number;
  modalidade_nome: string;
  tipo_pontuacao: string;
  filial_nome: string;
  members: Array<{
    atleta_id: string;
    atleta_nome: string;
    numero_identificador?: string;
  }>;
}

// Define the Modality interface expected by ViewAllTeamsTab
interface Modality {
  modalidade_id: number;
  modalidade_nome: string;
}

export function TeamsTab({ userId, eventId, isOrganizer = false }: TeamsTabProps) {
  const { user } = useAuth();
  
  // Check if user is ONLY a judge (judges should only view, not manage)
  // Representatives can manage their teams, organizers can manage all teams
  const isJudgeOnly = user?.papeis?.some(role => role.codigo === 'JUZ') && 
                      !user?.papeis?.some(role => role.codigo === 'RDD') &&
                      !user?.papeis?.some(role => role.codigo === 'ORE');
  
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
    teams: allTeamsRaw,
    modalities: allModalitiesRaw,
    branches,
    isLoading: isLoadingAllTeams,
    error: allTeamsError
  } = useAllTeamsData(eventId, modalityFilter, branchFilter, searchTerm, (isOrganizer || isJudgeOnly) ? undefined : user?.filial_id);

  // Transform the raw data to match expected interfaces
  const allTeams: Team[] = allTeamsRaw?.map(team => ({
    equipe_id: team.equipe_id,
    equipe_nome: team.equipe_nome,
    modalidade_id: team.modalidade_id,
    modalidade_nome: team.modalidade_nome,
    tipo_pontuacao: team.tipo_pontuacao,
    filial_nome: team.filial_nome,
    members: team.members
  })) || [];

  const allModalities: Modality[] = allModalitiesRaw?.map(modality => ({
    modalidade_id: modality.modalidade_id,
    modalidade_nome: modality.modalidade_nome
  })) || [];

  if (isLoading && !selectedModalityId) {
    return <LoadingTeamsState />;
  }

  if (!modalities || modalities.length === 0) {
    return <NoModalitiesMessage />;
  }

  // For judges only, show only the "View All Teams" tab with scoring capability
  if (isJudgeOnly) {
    return (
      <div className="space-y-6">
        <TeamsTabHeader isOrganizer={false}>
          <ViewAllTeamsTab
            allTeams={allTeams}
            allModalities={allModalities}
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
              allTeams={allTeams}
              allModalities={allModalities}
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
