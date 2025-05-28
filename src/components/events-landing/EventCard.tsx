
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/lib/types/database';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.data_inicio_inscricao);
    const endDate = new Date(event.data_fim_inscricao);
    
    if (event.status_evento === 'encerrado') {
      return { label: 'Encerrado', variant: 'secondary' as const };
    }
    
    if (event.status_evento === 'suspenso') {
      return { label: 'Suspenso', variant: 'destructive' as const };
    }
    
    if (now < startDate) {
      return { label: 'Em Breve', variant: 'outline' as const };
    }
    
    if (now >= startDate && now <= endDate) {
      return { label: 'Inscrições Abertas', variant: 'default' as const };
    }
    
    return { label: 'Inscrições Encerradas', variant: 'secondary' as const };
  };

  const handleEventClick = () => {
    navigate(`/events/${event.id}`);
  };

  const getLocationString = () => {
    const locationParts = [event.cidade, event.estado, event.pais].filter(Boolean);
    return locationParts.length > 0 ? locationParts.join(', ') : null;
  };

  const status = getEventStatus();
  const locationString = getLocationString();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={handleEventClick}>
      <div className="relative">
        {event.foto_evento ? (
          <img
            src={event.foto_evento}
            alt={event.nome}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-olimpics-green-primary to-olimpics-green-secondary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Trophy className="h-16 w-16 text-white/80" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge variant={status.variant} className="font-medium">
            {status.label}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-olimpics-green-primary transition-colors">
          {event.nome}
        </h3>
        
        {event.descricao && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.descricao}
          </p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            Inscrições: {format(new Date(event.data_inicio_inscricao), 'dd/MM/yyyy')} - {format(new Date(event.data_fim_inscricao), 'dd/MM/yyyy')}
          </div>
          
          {locationString && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              {locationString}
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            Tipo: {event.tipo}
          </div>
        </div>
        
        <Button 
          className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-primary/90"
          onClick={(e) => {
            e.stopPropagation();
            handleEventClick();
          }}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
