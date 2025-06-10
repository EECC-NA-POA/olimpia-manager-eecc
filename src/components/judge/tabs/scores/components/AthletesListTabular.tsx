
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { AthletesGrid } from './AthletesGrid';
import { AthletesTable } from './AthletesTable';
import { DynamicAthletesGrid } from './DynamicAthletesGrid';
import { useModelosModalidade } from '@/hooks/useDynamicScoring';
import { Athlete } from '../hooks/useAthletes';

interface AthletesListTabularProps {
  athletes: Athlete[];
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
  modalityRule?: any;
  selectedBateriaId?: number;
}

export function AthletesListTabular({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType = 'pontos',
  modalityRule,
  selectedBateriaId
}: AthletesListTabularProps) {
  // Check if this modality uses dynamic scoring
  const { data: modelos } = useModelosModalidade(modalityId);
  const hasDynamicScoring = modelos && modelos.length > 0;
  const modelo = modelos?.[0];

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Filter athletes by selected bateria if needed
  const filteredAthletes = selectedBateriaId 
    ? athletes.filter(athlete => {
        // This would need to be implemented based on your bateria-athlete relationship
        // For now, showing all athletes
        return true;
      })
    : athletes;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Atletas Inscritos ({filteredAthletes.length})
          {selectedBateriaId && (
            <span className="text-sm font-normal text-muted-foreground">
              - Bateria selecionada
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasDynamicScoring && modelo ? (
          <DynamicAthletesGrid
            athletes={filteredAthletes}
            modalityId={modalityId}
            eventId={eventId}
            judgeId={judgeId}
            modelo={modelo}
          />
        ) : (
          <>
            <AthletesGrid
              athletes={filteredAthletes}
              modalityId={modalityId}
              eventId={eventId}
              judgeId={judgeId}
              scoreType={scoreType}
            />
            
            <div className="mt-6">
              <AthletesTable
                athletes={filteredAthletes}
                modalityId={modalityId}
                eventId={eventId}
                judgeId={judgeId}
                scoreType={scoreType}
                modalityRule={modalityRule}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
