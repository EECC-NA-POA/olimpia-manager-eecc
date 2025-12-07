import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, FileText, ExternalLink } from 'lucide-react';
import { Event } from '@/lib/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface EventInfoCardProps {
  event: Event;
}

export function EventInfoCard({ event }: EventInfoCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'A definir';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getLocation = () => {
    const parts = [event.cidade, event.estado, event.pais].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Local a definir';
  };

  const getEventDates = () => {
    if (event.data_inicio_evento && event.data_fim_evento) {
      const start = formatDate(event.data_inicio_evento);
      const end = formatDate(event.data_fim_evento);
      return start === end ? start : `${start} até ${end}`;
    }
    if (event.data_inicio_evento) {
      return formatDate(event.data_inicio_evento);
    }
    return 'Datas a definir';
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Informações do Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Name */}
        <div>
          <h3 className="text-xl font-bold text-foreground">{event.nome}</h3>
          {event.descricao && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {event.descricao}
            </p>
          )}
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Data do Evento</p>
              <p className="text-sm font-medium">{getEventDates()}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="text-sm font-medium">{getLocation()}</p>
            </div>
          </div>
        </div>

        {/* Regulation Link */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => navigate('/regulamento')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Regulamento
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
