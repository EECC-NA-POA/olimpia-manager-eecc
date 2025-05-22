
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTable } from './TeamTable';
import { Team } from '../tabs/teams/types';
import { Badge } from '@/components/ui/badge';

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
  const [showDetails, setShowDetails] = useState(true);

  const hasAthletes = team.athletes && team.athletes.length > 0;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div onClick={() => setShowDetails(!showDetails)} className="cursor-pointer flex items-center gap-2">
            <CardTitle className="text-lg">{team.nome}</CardTitle>
            <Badge variant="outline" className="ml-2">{team.modalidade}</Badge>
          </div>
          
          {team.cor_uniforme && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Uniforme:</span>
              <Badge variant="outline">{team.cor_uniforme}</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-2">
          {!hasAthletes ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum atleta adicionado a esta equipe
            </div>
          ) : (
            <TeamTable 
              team={team} 
              isReadOnly={isReadOnly}
              onUpdateLane={onUpdateLane}
              onRemoveAthlete={onRemoveAthlete}
              isRemovePending={isRemovePending}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
