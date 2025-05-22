
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { Team } from '../tabs/teams/types';

interface TeamTableProps {
  team: Team;
  isReadOnly?: boolean;
  onUpdateLane?: (teamId: number, athleteId: string, lane: number, position: number) => void;
  onRemoveAthlete?: (teamId: number, athleteId: string) => void;
  isRemovePending?: boolean;
}

export function TeamTable({
  team,
  isReadOnly = false,
  onUpdateLane,
  onRemoveAthlete,
  isRemovePending = false
}: TeamTableProps) {
  if (!team.athletes || team.athletes.length === 0) {
    return null;
  }

  // Sort athletes by position
  const sortedAthletes = [...team.athletes].sort((a, b) => a.posicao - b.posicao);

  const handlePositionChange = (athleteId: string, position: number) => {
    if (!onUpdateLane) return;
    const lane = sortedAthletes.find(a => a.atleta_id === athleteId)?.raia || 0;
    onUpdateLane(team.id, athleteId, lane, position);
  };

  const handleLaneChange = (athleteId: string, lane: number) => {
    if (!onUpdateLane) return;
    const position = sortedAthletes.find(a => a.atleta_id === athleteId)?.posicao || 0;
    onUpdateLane(team.id, athleteId, lane, position);
  };

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atleta</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead className="w-20">Posição</TableHead>
            <TableHead className="w-20">Raia</TableHead>
            {!isReadOnly && <TableHead className="w-16">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAthletes.map((athlete) => (
            <TableRow key={athlete.id}>
              <TableCell className="font-medium">
                {athlete.atleta_nome}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {athlete.tipo_documento}: {athlete.numero_documento}
              </TableCell>
              <TableCell>
                {isReadOnly ? (
                  athlete.posicao || '-'
                ) : (
                  <Input
                    type="number"
                    min={1}
                    className="w-16 h-8 text-center"
                    value={athlete.posicao || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        handlePositionChange(athlete.atleta_id, val);
                      }
                    }}
                  />
                )}
              </TableCell>
              <TableCell>
                {isReadOnly ? (
                  athlete.raia || '-'
                ) : (
                  <Input
                    type="number"
                    min={0}
                    className="w-16 h-8 text-center"
                    value={athlete.raia || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        handleLaneChange(athlete.atleta_id, val);
                      }
                    }}
                  />
                )}
              </TableCell>
              {!isReadOnly && (
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveAthlete && onRemoveAthlete(team.id, athlete.atleta_id)}
                    disabled={isRemovePending}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
