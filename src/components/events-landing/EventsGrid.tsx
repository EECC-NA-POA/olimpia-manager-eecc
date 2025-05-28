
import React from 'react';
import { EventCard } from './EventCard';
import { Event } from '@/lib/types/database';

interface EventsGridProps {
  events: Event[];
}

export function EventsGrid({ events }: EventsGridProps) {
  if (!events.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          Nenhum evento encontrado com os filtros selecionados.
        </div>
      </div>
    );
  }

  // Group events by year and month
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.data_inicio_inscricao);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = {
        year,
        month: month.charAt(0).toUpperCase() + month.slice(1),
        events: []
      };
    }
    
    acc[key].events.push(event);
    return acc;
  }, {} as Record<string, { year: number; month: string; events: Event[] }>);

  return (
    <div className="space-y-12">
      {Object.entries(groupedEvents).map(([key, group]) => (
        <div key={key}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-olimpics-green-primary pb-2">
            {group.month} {group.year}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
