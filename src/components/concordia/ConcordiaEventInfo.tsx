import { Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const ConcordiaEventInfo = () => {
  const eventDate = '2025-11-30';
  const eventTime = '08:00';
  const eventEndTime = '13:00';
  const eventTitle = 'Torneio Concórdia 2025';
  const eventLocation = 'Bosque 950, R. Corrêa Lima, 950 - Porto Alegre - RS - Brasil';

  const handleAddToCalendar = () => {
    const startDateTime = `${eventDate}T${eventTime}:00`;
    const endDateTime = `${eventDate}T${eventEndTime}:00`;
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}&details=${encodeURIComponent('Torneio Concórdia - Vôlei de Praia e Tiro com Arco')}&location=${encodeURIComponent(eventLocation)}`;
    window.open(calendarUrl, '_blank');
  };

  const handleOpenMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-[#7CB342]/20 hover:border-[#7CB342]"
          onClick={handleAddToCalendar}
        >
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-[#7CB342] to-[#7CB342]/80 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Data e Horário</h3>
                <p className="text-gray-700 font-medium">Domingo, 30 de Novembro de 2025</p>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>8h às 13h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-[#7E57C2]/20 hover:border-[#7E57C2]"
          onClick={handleOpenMaps}
        >
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-[#7E57C2] to-[#7E57C2]/80 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Local</h3>
                <p className="text-gray-700 font-semibold">Bosque 950</p>
                <p className="text-gray-600 text-sm mt-1">R. Corrêa Lima, 950</p>
                <p className="text-gray-600 text-sm">Porto Alegre - RS - Brasil</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
