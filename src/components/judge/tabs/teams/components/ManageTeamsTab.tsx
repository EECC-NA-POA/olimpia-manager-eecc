
import React from 'react';
import { ModalityButtons } from './ModalityButtons';
import { TeamForm } from './TeamForm';
import { AthletesList } from './AthletesList';
import { TeamCard } from './TeamCard';
import { ModalityOption, TeamData, AthleteOption } from '../types';
import { DeleteTeamDialog } from './DeleteTeamDialog';

interface ManageTeamsTabProps {
  modalities: ModalityOption[];
  teams: TeamData[];
  availableAthletes: AthleteOption[];
  selectedModalityId: number | null;
  setSelectedModalityId: (id: number) => void;
  isLoading: boolean;
  createTeam: (name: string) => void;
  deleteTeam: (teamId: number) => void;
  addAthlete: (params: { teamId: number; athleteId: string }) => void;
  removeAthlete: (athleteTeamId: number) => void;
  updateAthletePosition: (params: { athleteTeamId: number; posicao?: number; raia?: number }) => void;
  isCreatingTeam: boolean;
  isDeletingTeam: boolean;
  isAddingAthlete: boolean;
  isRemovingAthlete: boolean;
  isUpdatingAthlete: boolean;
  isOrganizer: boolean;
  // Delete dialog props
  teamToDelete: TeamData | null;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  confirmDeleteTeam: () => void;
  cancelDeleteTeam: () => void;
}

export function ManageTeamsTab({
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
}: ManageTeamsTabProps) {
  // Wrapper functions to handle parameter signature differences
  const handleAddAthlete = (teamId: number, athleteId: string) => {
    addAthlete({ teamId, athleteId });
  };

  const handleUpdatePosition = (athleteTeamId: number, posicao?: number, raia?: number) => {
    updateAthletePosition({ athleteTeamId, posicao, raia });
  };

  return (
    <div className="space-y-6">
      <ModalityButtons
        modalities={modalities}
        selectedModalityId={selectedModalityId}
        onModalitySelect={setSelectedModalityId}
      />

      {selectedModalityId && (
        <>
          <TeamForm
            onCreateTeam={createTeam}
            isCreating={isCreatingTeam}
          />

          {availableAthletes.length > 0 && (
            <AthletesList
              athletes={availableAthletes}
              teams={teams}
              onAddAthlete={handleAddAthlete}
              isAdding={isAddingAthlete}
            />
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando equipes...</p>
            </div>
          ) : teams.length > 0 ? (
            <div className="grid gap-6">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onRemoveAthlete={removeAthlete}
                  onUpdatePosition={handleUpdatePosition}
                  onDeleteTeam={deleteTeam}
                  isRemoving={isRemovingAthlete}
                  isUpdating={isUpdatingAthlete}
                  isOrganizer={isOrganizer}
                  isDeletingTeam={isDeletingTeam}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma equipe criada ainda para esta modalidade.</p>
              <p className="text-sm mt-1">Use o formulário acima para criar uma nova equipe.</p>
            </div>
          )}
        </>
      )}

      <DeleteTeamDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        team={teamToDelete}
        onConfirm={confirmDeleteTeam}
        isDeleting={isDeletingTeam}
      />
    </div>
  );
}
