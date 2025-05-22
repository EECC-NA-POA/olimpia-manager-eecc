
import React from 'react';
import { TeamCard } from './team-formation/TeamCard';
import { useTeamFormation } from './team-formation/useTeamFormation';
import { AvailableAthletesList } from './team-formation/AvailableAthletesList';
import { Team, AvailableAthlete } from './tabs/teams/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    isRemovePending,
    isAddingAthlete
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
      {!isReadOnly && availableAthletes && availableAthletes.length > 0 && (
        <AvailableAthletesList 
          athletes={availableAthletes}
          teams={teams}
          onAddAthleteToTeam={handleAddAthleteToTeam}
          isPending={isAddingAthlete}
        />
      )}

      {/* Show addable athletes message when there are athletes available */}
      {!isReadOnly && availableAthletes && availableAthletes.length > 0 && (
        <Alert variant="info" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Selecione os atletas acima para adicioná-los à equipe. Depois, defina a posição e raia de cada atleta abaixo.
          </AlertDescription>
        </Alert>
      )}

      {/* Team cards */}
      <div className="space-y-6">
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
    </div>
  );
}
