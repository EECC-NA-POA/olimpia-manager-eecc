
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, User } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.atletas.map((athlete) => (
              <Card key={athlete.id} className="p-3 bg-muted/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="font-medium text-sm truncate">{athlete.atleta_nome}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      Filial: {athlete.filial_nome || 'N/A'}
                    </p>
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveAthlete(athlete.id)}
                      disabled={isRemoving}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
