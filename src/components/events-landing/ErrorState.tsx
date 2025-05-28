
import React from 'react';
import { EventsHeader } from './EventsHeader';
import { Calendar } from 'lucide-react';

export function ErrorState() {
  return (
    <div className="min-h-screen bg-olimpics-green-primary">
      <EventsHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Calendar className="h-16 w-16 text-white/80 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Eventos em Preparação
            </h3>
            <p className="text-white/90 mb-6 leading-relaxed">
              No momento não há eventos públicos disponíveis para visualização. 
              Novos eventos serão publicados em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
