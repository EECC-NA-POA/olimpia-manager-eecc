
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { TeamTableRow } from './TeamTableRow';
import { ReadOnlyTeamTableRow } from './ReadOnlyTeamTableRow';
import { TeamAthlete } from '../tabs/teams/types';

interface TeamTableProps {
  athletes: TeamAthlete[];
  teamId: number;
  isReadOnly?: boolean;
  onUpdateLane?: (teamId: number, athleteId: string, lane: number, position: number) => void;
  onRemoveAthlete?: (teamId: number, athleteId: string) => void;
  isRemovePending?: boolean;
}

export function TeamTable({ 
  athletes,
  teamId,
  isReadOnly = false,
  onUpdateLane,
  onRemoveAthlete,
  isRemovePending = false
}: TeamTableProps) {
  if (athletes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Nenhum atleta nesta equipe</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Posição</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Raia</TableHead>
          {!isReadOnly && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {athletes.map((athlete) => (
          isReadOnly ? (
            <ReadOnlyTeamTableRow
              key={athlete.id}
              athlete={athlete}
            />
          ) : (
            <TeamTableRow
              key={athlete.id}
              athlete={athlete}
              teamId={teamId}
              onUpdateLane={onUpdateLane || (() => {})}
              onRemoveAthlete={onRemoveAthlete || (() => {})}
              isRemovePending={isRemovePending}
            />
          )
        ))}
      </TableBody>
    </Table>
  );
}
