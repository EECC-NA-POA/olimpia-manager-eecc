import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TeamData } from '../types';

interface TeamCardProps {
  team: TeamData;
  onRemoveAthlete: (athleteTeamId: number) => void;
  isRemoving: boolean;
  isReadOnly?: boolean;
}

export function TeamCard({ team, onRemoveAthlete, isRemoving, isReadOnly = false }: TeamCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{team.nome}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {team.atletas.length} atletas
          </span>
        </CardTitle>
        {team.modalidade_info && (
          <p className="text-sm text-muted-foreground">
            {team.modalidade_info.nome} - {team.modalidade_info.categoria}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {team.atletas.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum atleta adicionado ainda
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atleta</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead>Raia</TableHead>
                {!isReadOnly && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.atletas.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell>{athlete.nome}</TableCell>
                  <TableCell>{athlete.documento}</TableCell>
                  <TableCell>{athlete.posicao || '-'}</TableCell>
                  <TableCell>{athlete.raia || '-'}</TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveAthlete(athlete.id)}
                        disabled={isRemoving}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
