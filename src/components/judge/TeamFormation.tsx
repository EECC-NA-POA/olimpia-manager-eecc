
import React from 'react';
import { TeamCard } from './team-formation/TeamCard';
import { useTeamFormation } from './team-formation/useTeamFormation';
import { AvailableAthletesList } from './team-formation/AvailableAthletesList';
import { Team, AvailableAthlete } from './tabs/teams/types';

interface TeamFormationProps {
  teams: Team[];
  availableAthletes: AvailableAthlete[];
  eventId: string | null;
  modalityId: number;
  isOrganizer?: boolean;
  isReadOnly?: boolean;
}

export function TeamFormation({ 
  teams, 
  availableAthletes,
  eventId,
  modalityId,
  isOrganizer = false,
  isReadOnly = false
}: TeamFormationProps) {
  const {
    handleAddAthleteToTeam,
    handleRemoveAthleteFromTeam,
    handleUpdateLane,
    isUpdatePending,
    isRemovePending
  } = useTeamFormation({ 
    teams, 
    eventId, 
    modalityId, 
    isOrganizer 
  });

  if (teams.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          Nenhuma equipe disponível para esta modalidade
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show available athletes for delegation representatives */}
      {!isReadOnly && availableAthletes.length > 0 && (
        <AvailableAthletesList 
          athletes={availableAthletes}
          teams={teams}
          onAddAthleteToTeam={handleAddAthleteToTeam}
        />
      )}

      {/* Team cards */}
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          isReadOnly={isReadOnly}
          onUpdateLane={handleUpdateLane}
          onRemoveAthlete={handleRemoveAthleteFromTeam}
          isRemovePending={isRemovePending}
        />
      ))}
    </div>
  );
}
