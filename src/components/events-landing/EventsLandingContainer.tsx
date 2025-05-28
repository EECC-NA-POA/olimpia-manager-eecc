
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { EventsHeader } from './EventsHeader';
import { EventsFilters } from './EventsFilters';
import { EventsGrid } from './EventsGrid';
import { SystemFeaturesSection } from './SystemFeaturesSection';
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
      <div className="min-h-screen">
        <EventsHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingImage text="Carregando sistema..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <EventsHeader />
        <div className="container mx-auto px-4 py-8">
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
    <div className="min-h-screen">
      <EventsHeader />
      
      {/* System Features Section */}
      <div className="bg-gradient-to-b from-white to-olimpics-background py-16">
        <div className="container mx-auto px-4">
          <SystemFeaturesSection />
        </div>
      </div>
      
      {/* Events Section */}
      <div className="bg-olimpics-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-olimpics-green-primary mb-4">
              Eventos Disponíveis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra e participe dos eventos esportivos organizados pela EECC
            </p>
          </div>
          
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
    </div>
  );
}
