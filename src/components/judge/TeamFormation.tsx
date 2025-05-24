
import React from 'react';
import { TeamCard } from './team-formation/TeamCard';
import { useTeamFormation } from './team-formation/useTeamFormation';
import { AvailableAthletesList } from './team-formation/AvailableAthletesList';
import { Team, AvailableAthlete } from './tabs/teams/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

interface TeamFormationProps {
  teams: Team[];
  availableAthletes: AvailableAthlete[];
  eventId: string | null;
  modalityId: number;
  isOrganizer?: boolean;
  isReadOnly?: boolean;
  branchId?: string | null;
}

export function TeamFormation({ 
  teams, 
  availableAthletes,
  eventId,
  modalityId,
  isOrganizer = false,
  isReadOnly = false,
  branchId
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
    isOrganizer,
    branchId 
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
      {/* Show available athletes for delegation representatives and organizers */}
      {!isReadOnly && availableAthletes && availableAthletes.length > 0 && (
        <>
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Atletas Disponíveis:</strong> Selecione os atletas abaixo para adicioná-los às equipes. 
              {isOrganizer && " Como organizador, você pode misturar atletas de diferentes filiais."}
              {!isOrganizer && " Após adicionar, você pode definir a posição e raia de cada atleta nas tabelas das equipes."}
            </AlertDescription>
          </Alert>
          
          <AvailableAthletesList 
            athletes={availableAthletes}
            teams={teams}
            onAddAthleteToTeam={handleAddAthleteToTeam}
            isPending={isAddingAthlete}
          />
        </>
      )}

      {/* Message when no available athletes */}
      {!isReadOnly && availableAthletes && availableAthletes.length === 0 && (
        <Alert variant="info" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {isOrganizer 
              ? "Todos os atletas desta modalidade já estão em equipes."
              : "Não há atletas disponíveis da sua filial para esta modalidade, ou todos os atletas já estão em equipes."
            }
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
            isOrganizer={isOrganizer}
            onUpdateLane={handleUpdateLane}
            onRemoveAthlete={handleRemoveAthleteFromTeam}
            isRemovePending={isRemovePending}
          />
        ))}
      </div>
    </div>
  );
}
