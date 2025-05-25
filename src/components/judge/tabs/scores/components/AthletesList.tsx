
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { AthleteFilters } from './AthleteFilters';
import { AthletesGrid } from './AthletesGrid';
import { AthletesCount } from './AthletesCount';
import { useAthleteFiltering } from './hooks/useAthleteFiltering';
import { Athlete } from '../hooks/useAthletes';

interface AthletesListProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'tempo' | 'distancia' | 'pontos';
}

export function AthletesList({
  athletes,
  isLoading,
  modalityId,
  eventId,
  judgeId,
  scoreType = 'pontos'
}: AthletesListProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const {
    filteredAthletes,
    filters,
    setFilters,
    resetFilters
  } = useAthleteFiltering(athletes || []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando atletas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!athletes || athletes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum atleta encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não há atletas inscritos nesta modalidade.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atletas Inscritos</CardTitle>
        <AthletesCount 
          total={athletes.length}
          filtered={filteredAthletes.length}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <AthleteFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />
        
        <AthletesGrid>
          {filteredAthletes.map((athlete) => (
            <AthleteCard
              key={athlete.atleta_id}
              athlete={athlete}
              modalityId={modalityId}
              scoreType={scoreType}
              eventId={eventId}
              judgeId={judgeId}
              isSelected={selectedAthleteId === athlete.atleta_id}
              onClick={() => setSelectedAthleteId(
                selectedAthleteId === athlete.atleta_id ? null : athlete.atleta_id
              )}
            />
          ))}
        </AthletesGrid>
      </CardContent>
    </Card>
  );
}
