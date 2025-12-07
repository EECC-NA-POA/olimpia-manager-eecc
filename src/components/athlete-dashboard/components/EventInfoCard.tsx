import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      // Parse as UTC to avoid timezone issues
      const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getLocation = () => {
    const parts = [event.cidade, event.estado, event.pais].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Local a definir';
  };

  const getEventDates = () => {
    // Priority: data_inicio and data_fim (main event dates)
    // Fallback: data_inicio_evento and data_fim_evento
    const startDate = event.data_inicio || event.data_inicio_evento;
    const endDate = event.data_fim || event.data_fim_evento;
    
    if (startDate && endDate) {
      const start = formatDate(startDate);
      const end = formatDate(endDate);
      return start === end ? start : `${start} até ${end}`;
    }
    if (startDate) {
      return formatDate(startDate);
    }
    return 'Datas a definir';
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/30">
        <h3 className="text-lg font-semibold text-foreground">{event.nome}</h3>
        {event.descricao && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {event.descricao}
          </p>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Event Details - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Data do Evento</p>
              <p className="text-sm font-medium text-foreground truncate">{getEventDates()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="text-sm font-medium text-foreground truncate">{getLocation()}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto shrink-0"
            onClick={() => navigate('/regulamento')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Regulamento
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
