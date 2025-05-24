
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
    addAthlete,
    removeAthlete,
    updateAthletePosition,
    isCreatingTeam,
    isAddingAthlete,
    isRemovingAthlete,
    isUpdatingAthlete
  } = useTeamManager(eventId, isOrganizer);

  // Data for viewing all teams - for organizers, don't filter by branch
  const {
    teams: allTeams,
    modalities: allModalities,
    branches,
    isLoading: isLoadingAllTeams,
    error: allTeamsError
  } = useAllTeamsData(eventId, modalityFilter, branchFilter, searchTerm, isOrganizer ? undefined : user?.filial_id);

  if (isLoading && !selectedModalityId) {
    return <LoadingTeamsState />;
  }

  if (!modalities || modalities.length === 0) {
    return <NoModalitiesMessage />;
  }

  return (
    <div className="space-y-6">
      <TeamsTabHeader isOrganizer={isOrganizer}>
        <Tabs defaultValue={isOrganizer ? "view-all" : "manage"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {!isOrganizer && (
              <TabsTrigger value="manage">Gerenciar Minhas Equipes</TabsTrigger>
            )}
            <TabsTrigger value="view-all">
              {isOrganizer ? "Gerenciar Todas as Equipes" : "Visualizar Todas as Equipes"}
            </TabsTrigger>
          </TabsList>
          
          {!isOrganizer && (
            <TabsContent value="manage">
              <ManageTeamsTab
                modalities={modalities}
                teams={teams}
                availableAthletes={availableAthletes}
                selectedModalityId={selectedModalityId}
                setSelectedModalityId={setSelectedModalityId}
                isLoading={isLoading}
                createTeam={createTeam}
                addAthlete={addAthlete}
                removeAthlete={removeAthlete}
                updateAthletePosition={updateAthletePosition}
                isCreatingTeam={isCreatingTeam}
                isAddingAthlete={isAddingAthlete}
                isRemovingAthlete={isRemovingAthlete}
                isUpdatingAthlete={isUpdatingAthlete}
              />
            </TabsContent>
          )}
          
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
            />
          </TabsContent>
        </Tabs>
      </TeamsTabHeader>
    </div>
  );
}
