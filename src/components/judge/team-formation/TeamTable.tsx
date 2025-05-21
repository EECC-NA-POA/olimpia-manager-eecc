
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ReadOnlyTeamTableRow } from './ReadOnlyTeamTableRow';
import { TeamAthlete } from '../tabs/teams/types';

interface TeamTableProps {
  athletes: TeamAthlete[];
  isReadOnly?: boolean;
}

export function TeamTable({ 
  athletes,
  isReadOnly = false
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {athletes.map((athlete) => (
          <ReadOnlyTeamTableRow
            key={athlete.id}
            athlete={athlete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
