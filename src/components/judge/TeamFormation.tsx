
import React from 'react';
import { TeamCard } from './team-formation/TeamCard';
import { useTeamFormation } from './team-formation/useTeamFormation';
import { Team, AvailableAthlete } from './tabs/teams/types';

interface TeamFormationProps {
  teams: Team[];
  availableAthletes: AvailableAthlete[];
  eventId: string | null;
  modalityId: number;
  isOrganizer?: boolean;
}

export function TeamFormation({ 
  teams, 
  availableAthletes, 
  eventId, 
  modalityId,
  isOrganizer = false
}: TeamFormationProps) {
  const {
    handleAddAthleteToTeam,
    handleRemoveAthleteFromTeam,
    handleUpdateLane,
    isUpdatePending,
    isRemovePending
  } = useTeamFormation({ teams, eventId, modalityId, isOrganizer });

  if (teams.length === 0 && availableAthletes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          Nenhuma equipe ou atleta disponível para esta modalidade
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          availableAthletes={availableAthletes}
          onAddAthlete={handleAddAthleteToTeam}
          onRemoveAthlete={handleRemoveAthleteFromTeam}
          onUpdateLane={handleUpdateLane}
          isUpdatePending={isUpdatePending}
          isRemovePending={isRemovePending}
        />
      ))}
    </div>
  );
}
