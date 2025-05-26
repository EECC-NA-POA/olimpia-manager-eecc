
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useManagementTeamManager } from './hooks/useManagementTeamManager';
import { ManagementTeamsTabHeader } from './components/ManagementTeamsTabHeader';
import { ManagementTeamsManageTab } from './components/ManagementTeamsManageTab';
import { NoModalitiesMessage } from '../../judge/tabs/teams/components/NoModalitiesMessage';
import { LoadingTeamsState } from '../../common/teams/LoadingTeamsState';

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

  // Create wrapper functions to match expected signatures
  const handleRemoveAthlete = (data: { teamId: number; athleteId: string }) => {
    // Find the athlete-team relationship ID
    const team = teams.find(t => t.id === data.teamId);
    if (team) {
      const athleteTeam = team.atletas.find((a: any) => a.atleta_id === data.athleteId);
      if (athleteTeam?.atleta_equipe_id) {
        removeAthlete(athleteTeam.atleta_equipe_id);
      }
    }
  };

  const handleUpdateAthletePosition = (data: { teamId: number; athleteId: string; position: number; lane?: number }) => {
    // Find the athlete-team relationship ID
    const team = teams.find(t => t.id === data.teamId);
    if (team) {
      const athleteTeam = team.atletas.find((a: any) => a.atleta_id === data.athleteId);
      if (athleteTeam?.atleta_equipe_id) {
        updateAthletePosition({
          athleteTeamId: athleteTeam.atleta_equipe_id,
          posicao: data.position,
          raia: data.lane
        });
      }
    }
  };

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
          removeAthlete={handleRemoveAthlete}
          updateAthletePosition={handleUpdateAthletePosition}
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
