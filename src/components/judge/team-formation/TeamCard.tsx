
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamTable } from './TeamTable';
import { Team } from '../tabs/teams/types';

interface TeamCardProps {
  team: Team;
  isReadOnly?: boolean;
  onUpdateLane?: (teamId: number, athleteId: string, lane: number, position: number) => void;
  onRemoveAthlete?: (teamId: number, athleteId: string) => void;
  isRemovePending?: boolean;
}

export function TeamCard({
  team,
  isReadOnly = false,
  onUpdateLane,
  onRemoveAthlete,
  isRemovePending = false
}: TeamCardProps) {
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
            isReadOnly={isReadOnly}
            onUpdateLane={onUpdateLane}
            onRemoveAthlete={onRemoveAthlete}
            isRemovePending={isRemovePending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
