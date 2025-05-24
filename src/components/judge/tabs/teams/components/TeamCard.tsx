
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users } from 'lucide-react';
import { TeamData } from '../types';

interface TeamCardProps {
  team: TeamData;
  onRemoveAthlete: (athleteTeamId: number) => void;
  onUpdatePosition?: (athleteTeamId: number, posicao?: number, raia?: number) => void;
  isRemoving: boolean;
  isUpdating?: boolean;
  isReadOnly?: boolean;
}

export function TeamCard({ 
  team, 
  onRemoveAthlete, 
  onUpdatePosition,
  isRemoving,
  isUpdating = false,
  isReadOnly = false 
}: TeamCardProps) {
  const handlePositionChange = (athleteTeamId: number, newPosition: string) => {
    if (onUpdatePosition) {
      const position = newPosition ? parseInt(newPosition) : undefined;
      onUpdatePosition(athleteTeamId, position);
    }
  };

  const handleLaneChange = (athleteTeamId: number, newLane: string) => {
    if (onUpdatePosition) {
      const lane = newLane ? parseInt(newLane) : undefined;
      onUpdatePosition(athleteTeamId, undefined, lane);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>{team.nome}</span>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {team.atletas.length} atleta{team.atletas.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        {team.modalidade_info && (
          <p className="text-sm text-muted-foreground">
            {team.modalidade_info.nome} - {team.modalidade_info.categoria}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {team.atletas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum atleta adicionado ainda</p>
            <p className="text-xs mt-1">Use a lista de atletas disponíveis acima para adicionar</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Atleta</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead className="w-24">Posição</TableHead>
                  <TableHead className="w-24">Raia</TableHead>
                  {!isReadOnly && <TableHead className="w-20">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.atletas.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell className="font-medium">{athlete.atleta_nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{athlete.documento}</TableCell>
                    <TableCell>
                      {isReadOnly ? (
                        <span className="text-sm">{athlete.posicao || '-'}</span>
                      ) : (
                        <Input
                          type="number"
                          min="1"
                          placeholder="Pos."
                          value={athlete.posicao || ''}
                          onChange={(e) => handlePositionChange(athlete.id, e.target.value)}
                          className="h-8 text-center"
                          disabled={isUpdating}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isReadOnly ? (
                        <span className="text-sm">{athlete.raia || '-'}</span>
                      ) : (
                        <Input
                          type="number"
                          min="1"
                          placeholder="Raia"
                          value={athlete.raia || ''}
                          onChange={(e) => handleLaneChange(athlete.id, e.target.value)}
                          className="h-8 text-center"
                          disabled={isUpdating}
                        />
                      )}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onRemoveAthlete(athlete.id)}
                          disabled={isRemoving}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
