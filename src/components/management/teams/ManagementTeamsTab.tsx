import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useManagementTeamManager } from './hooks/useManagementTeamManager';
import { ManagementTeamsTabHeader } from './components/ManagementTeamsTabHeader';
import { ManagementTeamsManageTab } from './components/ManagementTeamsManageTab';
import { NoModalitiesMessage } from '../../judge/tabs/teams/components/NoModalitiesMessage';
import { LoadingTeamsState } from '../../judge/tabs/teams/components/LoadingTeamsState';

interface ManagementTeamsTabProps {
  userId: string;
  eventId: string | null;
  isOrganizer?: boolean;
}

export function ManagementTeamsTab({ userId, eventId, isOrganizer = false }: ManagementTeamsTabProps) {
  const { user } = useAuth();

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
  } = useManagementTeamManager(eventId, isOrganizer);

  if (isLoading && !selectedModalityId) {
    return <LoadingTeamsState />;
  }

  if (!modalities || modalities.length === 0) {
    return <NoModalitiesMessage />;
  }

  return (
    <div className="space-y-6">
      <ManagementTeamsTabHeader isOrganizer={isOrganizer}>
        <ManagementTeamsManageTab
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
      </ManagementTeamsTabHeader>
    </div>
  );
}
