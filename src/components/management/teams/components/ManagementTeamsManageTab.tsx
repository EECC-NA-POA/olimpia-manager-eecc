
import React from 'react';
import { ManagementModalityButtons } from './ManagementModalityButtons';
import { ManagementTeamForm } from './ManagementTeamForm';
import { ManagementAthletesList } from './ManagementAthletesList';
import { TeamCard } from '../../../judge/tabs/teams/components/TeamCard';
import { ModalityOption, TeamData, AthleteOption } from '../../../judge/tabs/teams/types';
import { ManagementDeleteTeamDialog } from './ManagementDeleteTeamDialog';

interface ManagementTeamsManageTabProps {
  modalities: ModalityOption[];
  teams: TeamData[];
  availableAthletes: AthleteOption[];
  selectedModalityId: number | null;
  setSelectedModalityId: (id: number | null) => void;
  isLoading: boolean;
  createTeam: (name: string) => void;
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
      <ManagementModalityButtons
        modalities={modalities}
        selectedModalityId={selectedModalityId}
        onSelectModality={setSelectedModalityId}
      />

      {selectedModalityId && selectedModality && (
        <>
          {/* Team Creation Form */}
          <ManagementTeamForm
            modalityId={selectedModalityId}
            modalityName={selectedModality.nome}
            onCreateTeam={createTeam}
            isCreating={isCreatingTeam}
            isOrganizer={isOrganizer}
          />

          {/* Available Athletes */}
          <ManagementAthletesList
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
                onRemoveAthlete={(athleteTeamId: number) => {
                  // Find the athlete by athleteTeamId to get teamId and athleteId
                  const athlete = team.atletas.find((a: any) => a.atleta_equipe_id === athleteTeamId);
                  if (athlete) {
                    removeAthlete({ teamId: team.id, athleteId: athlete.atleta_id });
                  }
                }}
                onUpdatePosition={(athleteTeamId: number, posicao?: number, raia?: number) => {
                  // Find the athlete by athleteTeamId to get teamId and athleteId
                  const athlete = team.atletas.find((a: any) => a.atleta_equipe_id === athleteTeamId);
                  if (athlete && posicao !== undefined) {
                    updateAthletePosition({ 
                      teamId: team.id, 
                      athleteId: athlete.atleta_id, 
                      position: posicao, 
                      lane: raia 
                    });
                  }
                }}
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
      <ManagementDeleteTeamDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        team={teamToDelete}
        onConfirm={confirmDeleteTeam}
        isDeleting={isDeletingTeam}
      />
    </div>
  );
}
