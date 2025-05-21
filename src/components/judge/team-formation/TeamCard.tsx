
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamTable } from './TeamTable';
import { Team } from '../tabs/teams/types';

interface TeamCardProps {
  team: Team;
  isReadOnly?: boolean;
}

export function TeamCard({
  team,
  isReadOnly = false
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
            isReadOnly={isReadOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}
