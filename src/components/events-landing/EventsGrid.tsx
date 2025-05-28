
import React from 'react';
import { EventCard } from './EventCard';
import { Event } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

interface EventsGridProps {
  events: Event[];
}

export function EventsGrid({ events }: EventsGridProps) {
  const navigate = useNavigate();

  if (!events.length) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum evento público disponível
          </h3>
          <p className="text-gray-500 mb-6">
            No momento não há eventos com inscrições abertas ao público. 
            Novos eventos serão publicados em breve.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
            >
              <Users className="h-4 w-4 mr-2" />
              Fazer Login
            </Button>
            <p className="text-sm text-gray-400">
              Já possui cadastro? Faça login para acessar eventos específicos
            </p>
          </div>
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
