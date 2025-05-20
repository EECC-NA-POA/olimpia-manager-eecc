
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow } from '@/components/ui/table';

interface TeamTableRowProps {
  athlete: any;
  teamId: number;
  onUpdateLane: (teamId: number, athleteId: string, lane: number, position: number) => void;
  onRemoveAthlete: (teamId: number, athleteId: string) => void;
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
      <TableCell>{athlete.usuarios.nome_completo}</TableCell>
      <TableCell>
        <Input 
          type="number" 
          min="1"
          value={athlete.raia || ''}
          onChange={(e) => 
            onUpdateLane(
              teamId, 
              athlete.atleta_id, 
              Number(e.target.value), 
              athlete.posicao
            )
          }
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemoveAthlete(teamId, athlete.atleta_id)}
          disabled={isRemovePending}
        >
          Remover
        </Button>
      </TableCell>
    </TableRow>
  );
}
