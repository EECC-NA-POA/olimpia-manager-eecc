
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { CleanTeamScoringTab } from './teams/components/CleanTeamScoringTab';

interface CleanTeamsTabProps {
  userId: string;
  eventId: string | null;
}

export function CleanTeamsTab({ userId, eventId }: CleanTeamsTabProps) {
  const [modalityFilter, setModalityFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pontuação de Equipes (Nova Implementação)
          </CardTitle>
          <CardDescription>
            Sistema limpo de pontuação de equipes sem referências a baterias desnecessárias.
            Focado apenas em modalidades coletivas com formulários dinâmicos simples.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CleanTeamScoringTab
            eventId={eventId}
            judgeId={userId}
            modalityFilter={modalityFilter}
            setModalityFilter={setModalityFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </CardContent>
      </Card>
    </div>
  );
}
