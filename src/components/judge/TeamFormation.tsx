
import React from 'react';
import { TeamCard } from './team-formation/TeamCard';
import { Team } from './tabs/teams/types';

interface TeamFormationProps {
  teams: Team[];
  availableAthletes: any[];
  eventId: string | null;
  modalityId: number;
  isOrganizer?: boolean;
  isReadOnly?: boolean;
}

export function TeamFormation({ 
  teams, 
  eventId,
  isReadOnly = false
}: TeamFormationProps) {
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
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          isReadOnly={isReadOnly}
        />
      ))}
    </div>
  );
}
