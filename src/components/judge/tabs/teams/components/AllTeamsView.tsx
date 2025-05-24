
import React from 'react';
import { TeamCard } from './TeamCard';
import { TeamData } from '../types';

interface AllTeamsViewProps {
  teams: TeamData[];
  isOrganizer: boolean;
  eventId: string | null;
  isReadOnly?: boolean;
}

export function AllTeamsView({ teams, isOrganizer, eventId, isReadOnly = false }: AllTeamsViewProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma equipe encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onRemoveAthlete={() => {}} // Não permite remoção na visualização "Ver Todas"
          isRemoving={false}
          isReadOnly={true}
          isOrganizer={isOrganizer}
          isViewAll={true} // Nova prop para indicar que é a visualização "Ver Todas"
        />
      ))}
    </div>
  );
}
