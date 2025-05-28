
import React from 'react';
import { Calendar } from 'lucide-react';

export function EventsHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex justify-center items-center gap-3 mb-4">
        <Calendar className="h-12 w-12 text-olimpics-green-primary" />
        <h1 className="text-4xl md:text-5xl font-bold text-olimpics-green-primary">
          Eventos Disponíveis
        </h1>
      </div>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Descubra e participe dos eventos esportivos organizados pela Escola do Esporte com Coração
      </p>
    </div>
  );
}
