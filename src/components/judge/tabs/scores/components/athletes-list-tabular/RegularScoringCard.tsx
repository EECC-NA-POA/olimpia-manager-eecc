
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Athlete } from '../../hooks/useAthletes';
import { AthletesTable } from '../AthletesTable';

interface RegularScoringCardProps {
  athletes: Athlete[];
  modalityId: number;
  eventId: string;
  judgeId: string;
  scoreType: 'tempo' | 'distancia' | 'pontos';
  modalityRule: any;
  selectedBateriaId: number | null;
}

export function RegularScoringCard({
  athletes,
  modalityId,
  eventId,
  judgeId,
  scoreType,
  modalityRule,
  selectedBateriaId
}: RegularScoringCardProps) {
  console.log('=== SHOWING REGULAR ATHLETES TABLE ===');
  console.log('Athletes for regular table:', athletes);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">
            Lista de Atletas
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Mostrando {athletes.length} de {athletes.length} atletas
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <AthletesTable
          athletes={athletes}
          modalityId={modalityId}
          eventId={eventId}
          judgeId={judgeId}
          scoreType={scoreType}
          modalityRule={modalityRule}
          selectedBateriaId={selectedBateriaId}
        />
      </CardContent>
    </Card>
  );
}
