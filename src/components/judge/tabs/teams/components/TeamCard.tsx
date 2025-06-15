
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, User, MapPin } from 'lucide-react';
import { TeamData } from '../types';
import { useAuth } from '@/contexts/AuthContext';

interface TeamCardProps {
  team: TeamData;
  onRemoveAthlete: (athleteTeamId: number) => void;
  onUpdatePosition?: (athleteTeamId: number, posicao?: number, raia?: number) => void;
  onDeleteTeam?: (teamId: number) => void;
  isRemoving: boolean;
  isUpdating?: boolean;
  isReadOnly?: boolean;
  isOrganizer?: boolean;
  isViewAll?: boolean;
  isDeletingTeam?: boolean;
}

export function TeamCard({ 
  team, 
  onRemoveAthlete, 
  onUpdatePosition,
  onDeleteTeam,
  isRemoving,
  isUpdating = false,
  isReadOnly = false,
  isOrganizer = false,
  isViewAll = false,
  isDeletingTeam = false
}: TeamCardProps) {
  const { user } = useAuth();
  
  // Determina se é juiz
  const isJudgeOnly = user?.papeis?.some(role => role.codigo === 'JUZ') &&
                      !user?.papeis?.some(role => role.codigo === 'RDD') &&
                      !user?.papeis?.some(role => role.codigo === 'ORE');

  // Só pode deletar se não for juiz nem uma das telas de visualização
  const canDelete = !isJudgeOnly && !isReadOnly && !isViewAll;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>{team.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {team.atletas.length} atleta{team.atletas.length !== 1 ? 's' : ''}
            </Badge>
            {/* NUNCA exibe o botão de deletar para juiz */}
            {canDelete && onDeleteTeam && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteTeam(team.id)}
                disabled={isDeletingTeam}
                className="h-8 px-2"
                title="Excluir equipe"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
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
            {/* NÃO mostra dica para juiz */}
            {!isViewAll && !isJudgeOnly && (
              <p className="text-xs mt-1">Use a lista de atletas disponíveis acima para adicionar</p>
            )}
          </div>
        ) : (
          <div className={isViewAll ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
            {team.atletas.map((athlete) => (
              <Card key={athlete.id} className={isViewAll ? "p-3 bg-muted/30" : "p-4 bg-muted/30"}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className={`font-medium truncate ${isViewAll ? 'text-xs' : 'text-sm'}`}>
                        {athlete.atleta_nome}
                      </p>
                    </div>
                  </div>
                  {/* NUNCA mostra o botão para remover atleta se for juiz */}
                  {canDelete && (
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
                
                {/* Só mostrar filial na visualização "Ver Todas" */}
                {isViewAll && athlete.filial_nome && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {athlete.filial_nome}
                    </span>
                  </div>
                )}
                
                {/* Informações completas para outras visualizações */}
                {!isViewAll && (
                  <div className="space-y-2">
                    {athlete.filial_nome && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {athlete.filial_nome}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
