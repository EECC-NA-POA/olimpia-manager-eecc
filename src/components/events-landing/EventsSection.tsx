
import React from 'react';
import { EventsFilters } from './EventsFilters';
import { EventsGrid } from './EventsGrid';
import { Event } from '@/lib/types/database';

type FilterStatus = 'all' | 'open' | 'closed' | 'upcoming';
type SortBy = 'date' | 'name';

interface EventsSectionProps {
  events: Event[];
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
}

export function EventsSection({ 
  events, 
  filterStatus, 
  setFilterStatus, 
  sortBy, 
  setSortBy 
}: EventsSectionProps) {
  const filteredEvents = events.filter(event => {
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
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Eventos Disponíveis
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Descubra e participe dos eventos esportivos organizados pela EECC
          </p>
        </div>
        
        {events.length > 0 && (
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
