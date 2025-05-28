
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EventsHeader } from './EventsHeader';
import { EventsFilters } from './EventsFilters';
import { EventsGrid } from './EventsGrid';
import { LoadingImage } from '@/components/ui/loading-image';
import { Event } from '@/lib/types/database';

type FilterStatus = 'all' | 'open' | 'closed' | 'upcoming';
type SortBy = 'date' | 'name';

export function EventsLandingContainer() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('visibilidade_publica', true)
        .order('data_inicio_inscricao', { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
        <div className="container mx-auto px-4 py-8">
          <EventsHeader />
          <div className="flex items-center justify-center h-64">
            <LoadingImage text="Carregando eventos..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
        <div className="container mx-auto px-4 py-8">
          <EventsHeader />
          <div className="text-center text-red-600 mt-8">
            Erro ao carregar eventos. Tente novamente mais tarde.
          </div>
        </div>
      </div>
    );
  }

  // Always show the page structure, even if no public events are available
  const publicEvents = events || [];

  const filteredEvents = publicEvents.filter(event => {
    if (filterStatus === 'all') return true;
    
    const now = new Date();
    const startDate = new Date(event.data_inicio_inscricao);
    const endDate = new Date(event.data_fim_inscricao);
    
    switch (filterStatus) {
      case 'open':
        return now >= startDate && now <= endDate && event.status_evento === 'ativo';
      case 'closed':
        return now > endDate || event.status_evento === 'encerrado';
      case 'upcoming':
        return now < startDate;
      default:
        return true;
    }
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.nome.localeCompare(b.nome);
    }
    return new Date(b.data_inicio_inscricao).getTime() - new Date(a.data_inicio_inscricao).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-olimpics-background to-white">
      <div className="container mx-auto px-4 py-8">
        <EventsHeader />
        {publicEvents.length > 0 && (
          <EventsFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}
        <EventsGrid events={sortedEvents} />
      </div>
    </div>
  );
}
