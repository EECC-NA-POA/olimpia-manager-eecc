
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { type Athlete } from '../hooks/useAthletes';
import { AthleteCard } from '@/components/judge/AthleteCard';

interface AthletesListProps {
  athletes: Athlete[] | undefined;
  isLoading: boolean;
  modalityId: number | null;
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
  scoreType = 'points'
}: AthletesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  // Filter athletes by name
  const filteredAthletes = athletes?.filter(athlete => 
    athlete.atleta_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    );
  }

  if (!athletes || athletes.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Nenhum atleta encontrado para esta modalidade
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAthleteClick = (athlete: Athlete) => {
    setSelectedAthleteId(athlete.atleta_id);
    // Navigate to athlete score page or open score modal
    console.log('Athlete clicked:', athlete);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar atleta por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAthletes?.map((athlete) => (
          <AthleteCard 
            key={athlete.atleta_id} 
            athlete={athlete}
            onClick={() => handleAthleteClick(athlete)}
            isSelected={selectedAthleteId === athlete.atleta_id}
            modalityId={modalityId || undefined}
          />
        ))}
      </div>
    </div>
  );
}
