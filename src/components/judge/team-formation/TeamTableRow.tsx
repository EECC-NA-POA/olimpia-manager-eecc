import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow } from '@/components/ui/table';
import { TeamAthlete } from '../tabs/teams/types';

interface TeamTableRowProps {
  athlete: TeamAthlete;
  teamId: number;
  onUpdateLane: (athleteTeamId: number, lane: number | null) => void;
  onRemoveAthlete: (athleteTeamId: number) => void;
  isRemovePending: boolean;
}

export function TeamTableRow({ 
  athlete, 
  teamId, 
  onUpdateLane, 
  onRemoveAthlete,
  isRemovePending 
}: TeamTableRowProps) {
  return (
    <TableRow>
      <TableCell>{athlete.posicao}</TableCell>
      <TableCell>{athlete.atleta_nome}</TableCell>
      <TableCell>
        <Input 
          type="number" 
          min="1"
          value={athlete.raia || ''}
          onChange={(e) => 
            onUpdateLane(
              athlete.id, 
              e.target.value ? Number(e.target.value) : null
            )
          }
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemoveAthlete(athlete.id)}
          disabled={isRemovePending}
        >
          Remover
        </Button>
      </TableCell>
    </TableRow>
  );
}
