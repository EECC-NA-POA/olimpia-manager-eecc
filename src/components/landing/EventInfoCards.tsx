
import React from 'react';
import { Card } from "@/components/ui/card";
import { MapPin, Calendar } from 'lucide-react';

interface EventInfoCardsProps {
  handleLocationClick: () => void;
  handleCalendarSync: (startDate: string, endDate: string, title: string) => void;
}

export const EventInfoCards: React.FC<EventInfoCardsProps> = ({ 
  handleLocationClick, 
  handleCalendarSync 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card 
        className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer animate-fade-in"
        onClick={handleLocationClick}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-full bg-olimpics-green-primary/10">
            <MapPin className="w-8 h-8 text-olimpics-green-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Local</h3>
            <p className="text-olimpics-text text-lg mb-2">
              São Francisco Xavier - SP
            </p>
            <p className="text-sm text-gray-600 italic">
              Clique para ver no mapa
            </p>
          </div>
        </div>
      </Card>

      <Card 
        className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer animate-fade-in"
        onClick={() => handleCalendarSync('2025-07-10', '2025-07-11', 'Pré-temporada - Olimpíadas Nacionais EECC 2025')}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-full bg-olimpics-green-primary/10">
            <Calendar className="w-8 h-8 text-olimpics-green-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Pré-temporada</h3>
            <p className="text-olimpics-text text-lg mb-2">10 e 11 de Julho</p>
            <p className="text-sm text-gray-600 italic">
              Clique para adicionar ao calendário
            </p>
          </div>
        </div>
      </Card>

      <Card 
        className="p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white/95 backdrop-blur cursor-pointer animate-fade-in"
        onClick={() => handleCalendarSync('2025-07-12', '2025-07-13', 'Olimpíadas Nacionais EECC 2025')}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-full bg-olimpics-green-primary/10">
            <Calendar className="w-8 h-8 text-olimpics-green-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-olimpics-green-primary mb-2">Olimpíadas</h3>
            <p className="text-olimpics-text text-lg mb-2">12 e 13 de Julho</p>
            <p className="text-sm text-gray-600 italic">
              Clique para adicionar ao calendário
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
