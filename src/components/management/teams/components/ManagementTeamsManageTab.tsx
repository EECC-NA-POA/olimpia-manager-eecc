
import React from 'react';
import { ModalityButtons } from '../../../judge/tabs/teams/components/ModalityButtons';
import { TeamForm } from '../../../judge/tabs/teams/components/TeamForm';
import { AthletesList } from '../../../judge/tabs/teams/components/AthletesList';
import { TeamCard } from '../../../judge/tabs/teams/components/TeamCard';
import { ModalityOption, TeamData, AthleteOption } from '../../../judge/tabs/teams/types';
import { DeleteTeamDialog } from '../../../judge/tabs/teams/components/DeleteTeamDialog';

interface ManagementTeamsManageTabProps {
  modalities: ModalityOption[];
  teams: TeamData[];
  availableAthletes: AthleteOption[];
  selectedModalityId: number | null;
  setSelectedModalityId: (id: number | null) => void;
  isLoading: boolean;
  createTeam: (data: any) => void;
  deleteTeam: (teamId: number) => void;
  addAthlete: (data: { teamId: number; athleteId: string }) => void;
  removeAthlete: (data: { teamId: number; athleteId: string }) => void;
  updateAthletePosition: (data: { teamId: number; athleteId: string; position: number; lane?: number }) => void;
  isCreatingTeam: boolean;
  isDeletingTeam: boolean;
  isAddingAthlete: boolean;
  isRemovingAthlete: boolean;
  isUpdatingAthlete: boolean;
  isOrganizer: boolean;
  teamToDelete: TeamData | null;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  confirmDeleteTeam: () => void;
  cancelDeleteTeam: () => void;
}

export function ManagementTeamsManageTab({
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
  isOrganizer,
  teamToDelete,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  confirmDeleteTeam,
  cancelDeleteTeam
}: ManagementTeamsManageTabProps) {
  const selectedModality = modalities.find(m => m.id === selectedModalityId);

  return (
    <div className="space-y-6">
      {/* Modality Selection */}
      <ModalityButtons
        modalities={modalities}
        selectedModalityId={selectedModalityId}
        onSelectModality={setSelectedModalityId}
      />

      {selectedModalityId && selectedModality && (
        <>
          {/* Team Creation Form */}
          <TeamForm
            modalityId={selectedModalityId}
            modalityName={selectedModality.nome}
            onCreateTeam={createTeam}
            isCreating={isCreatingTeam}
            isOrganizer={isOrganizer}
          />

          {/* Available Athletes */}
          <AthletesList
            athletes={availableAthletes}
            teams={teams}
            onAddAthlete={addAthlete}
            isAdding={isAddingAthlete}
            isOrganizer={isOrganizer}
          />

          {/* Teams */}
          <div className="space-y-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDeleteTeam={deleteTeam}
                onRemoveAthlete={removeAthlete}
                onUpdateAthletePosition={updateAthletePosition}
                isDeleting={isDeletingTeam}
                isRemoving={isRemovingAthlete}
                isUpdating={isUpdatingAthlete}
                isOrganizer={isOrganizer}
                showScoring={false}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteTeamDialog
        isOpen={isDeleteDialogOpen}
        onClose={cancelDeleteTeam}
        onConfirm={confirmDeleteTeam}
        teamName={teamToDelete?.nome || ''}
      />
    </div>
  );
}
