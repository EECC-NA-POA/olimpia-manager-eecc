
import React, { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AthleteCard } from '@/components/judge/AthleteCard';
import { Athlete } from '../hooks/useAthletes';
import { AthleteFilters } from './AthleteFilters';

interface AthletesListProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number;
  eventId: string | null;
  judgeId: string;
  scoreType?: 'time' | 'distance' | 'points';
}

export function AthletesList({ 
  athletes, 
  isLoading, 
  modalityId, 
  eventId, 
  judgeId, 
  scoreType 
}: AthletesListProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterType, setFilterType] = useState<'id' | 'name' | 'filial' | 'estado'>('name');

  // Filter athletes based on search criteria
  const filteredAthletes = useMemo(() => {
    if (!athletes || !searchFilter.trim()) return athletes;

    const searchTerm = searchFilter.toLowerCase().trim();
    
    return athletes.filter(athlete => {
      switch (filterType) {
        case 'id':
          // Search in athlete ID (last 6 characters) or numero_identificador if available
          const athleteId = athlete.atleta_id.slice(-6).toLowerCase();
          return athleteId.includes(searchTerm);
        
        case 'name':
          return athlete.atleta_nome.toLowerCase().includes(searchTerm);
        
        case 'filial':
          // This would need branch data to be included in the athlete object
          // For now, we'll skip this filtering as it requires additional data
          return true;
        
        case 'estado':
          // This would need state data to be included in the athlete object
          // For now, we'll skip this filtering as it requires additional data
          return true;
        
        default:
          return true;
      }
    });
  }, [athletes, searchFilter, filterType]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!filteredAthletes || filteredAthletes.length === 0) {
    return (
      <div className="space-y-4">
        <AthleteFilters
          searchFilter={searchFilter}
          onSearchFilterChange={setSearchFilter}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {!athletes || athletes.length === 0 
              ? 'Nenhum atleta inscrito nesta modalidade'
              : 'Nenhum atleta encontrado com os filtros aplicados'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AthleteFilters
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAthletes.map((athlete) => (
          <AthleteCard
            key={athlete.atleta_id}
            athlete={athlete}
            isSelected={selectedAthleteId === athlete.atleta_id}
            onClick={() => setSelectedAthleteId(
              selectedAthleteId === athlete.atleta_id ? null : athlete.atleta_id
            )}
            modalityId={modalityId}
            scoreType={scoreType}
            eventId={eventId}
            judgeId={judgeId}
          />
        ))}
      </div>

      {searchFilter && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredAthletes.length} de {athletes?.length || 0} atletas
        </div>
      )}
    </div>
  );
}
