
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamTable } from './TeamTable';
import { AvailableAthletesList } from './AvailableAthletesList';

interface TeamCardProps {
  team: any;
  availableAthletes: any[];
  onAddAthlete: (teamId: number, athleteId: string) => void;
  onRemoveAthlete: (teamId: number, athleteId: string) => void;
  onUpdateLane: (teamId: number, athleteId: string, lane: number, position: number) => void;
  isUpdatePending: boolean;
  isRemovePending: boolean;
}

export function TeamCard({
  team,
  availableAthletes,
  onAddAthlete,
  onRemoveAthlete,
  onUpdateLane,
  isUpdatePending,
  isRemovePending
}: TeamCardProps) {
  const handleAddAthlete = (athleteId: string) => {
    onAddAthlete(team.id, athleteId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{team.nome}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TeamTable
            athletes={team.athletes}
            teamId={team.id}
            onUpdateLane={onUpdateLane}
            onRemoveAthlete={onRemoveAthlete}
            isRemovePending={isRemovePending}
          />
          
          <AvailableAthletesList 
            athletes={availableAthletes}
            onAddAthlete={handleAddAthlete}
            isPending={isUpdatePending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
