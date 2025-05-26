
import React from 'react';
import { TeamCard } from './TeamCard';
import { TransformedTeam } from '../types';

interface AllTeamsViewProps {
  teams: TransformedTeam[];
  isOrganizer: boolean;
  eventId: string | null;
  isReadOnly?: boolean;
  judgeId?: string;
}

export function AllTeamsView({ teams, isOrganizer, eventId, isReadOnly = false, judgeId }: AllTeamsViewProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma equipe encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard
          key={team.equipe_id}
          team={{
            id: team.equipe_id,
            nome: team.equipe_nome,
            modalidade_id: team.modalidade_id,
            filial_id: team.filial_nome,
            evento_id: eventId || '',
            atletas: team.members.map((member, index) => ({
              id: index,
              atleta_id: member.atleta_id,
              atleta_nome: member.atleta_nome,
              posicao: index + 1,
              documento: '',
              numero_identificador: member.numero_identificador
            }))
          }}
          onRemoveAthlete={() => {}} // Não permite remoção na visualização "Ver Todas"
          isRemoving={false}
          isReadOnly={true}
          isOrganizer={isOrganizer}
          isViewAll={true} // Nova prop para indicar que é a visualização "Ver Todas"
        />
      ))}
    </div>
  );
}
