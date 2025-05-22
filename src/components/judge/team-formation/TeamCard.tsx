
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Team } from '../tabs/teams/types';
import { TeamTable } from './TeamTable';

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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">{team.nome}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {team.modalidades?.categoria && (
              <Badge variant="outline" className="text-xs">
                {team.modalidades.categoria}
              </Badge>
            )}
            {team.modalidades?.nome && (
              <span className="text-sm text-muted-foreground">
                {team.modalidades.nome}
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {team.athletes?.length || 0} {(team.athletes?.length || 0) === 1 ? 'atleta' : 'atletas'}
        </div>
      </CardHeader>
      <CardContent>
        {team.observacoes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">{team.observacoes}</p>
          </div>
        )}
        
        <TeamTable 
          athletes={team.athletes || []} 
          isReadOnly={isReadOnly}
          onUpdateLane={onUpdateLane ? (athleteId, lane, position) => onUpdateLane(team.id, athleteId, lane, position) : undefined}
          onRemoveAthlete={onRemoveAthlete ? (athleteId) => onRemoveAthlete(team.id, athleteId) : undefined}
          isRemovePending={isRemovePending}
        />
      </CardContent>
    </Card>
  );
}
