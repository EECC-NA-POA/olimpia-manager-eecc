import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { TeamAthlete } from '../tabs/teams/types';

interface ReadOnlyTeamTableRowProps {
  athlete: TeamAthlete;
}

export function ReadOnlyTeamTableRow({ athlete }: ReadOnlyTeamTableRowProps) {
  return (
    <TableRow>
      <TableCell>{athlete.posicao}</TableCell>
      <TableCell>{athlete.atleta_nome}</TableCell>
      <TableCell>{athlete.raia || '-'}</TableCell>
    </TableRow>
  );
}
