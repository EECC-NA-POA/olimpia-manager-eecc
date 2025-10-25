
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAvailableEvents } from '@/lib/api';
import { Event } from '@/types/api';
import { ChevronDown, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface MobileEventSwitcherProps {
  userId: string;
}

export function MobileEventSwitcher({ userId }: MobileEventSwitcherProps) {
  const { currentEventId, setCurrentEventId } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch available events
  const { data: availableEvents, isLoading } = useQuery({
    queryKey: ['available-events', userId],
    queryFn: () => getAvailableEvents(userId),
  });

  // Set selected event when events are loaded or currentEventId changes
  useEffect(() => {
    if (availableEvents && currentEventId) {
      const event = availableEvents.find(event => event.id === currentEventId);
      if (event) setSelectedEvent(event);
    }
  }, [availableEvents, currentEventId]);

  const handleEventChange = (eventId: string) => {
    setCurrentEventId(eventId);
    
    // Update selected event
    if (availableEvents) {
      const event = availableEvents.find(event => event.id === eventId);
      if (event) setSelectedEvent(event);
    }
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
      </div>
    );
  }

  if (!availableEvents || availableEvents.length === 0) {
    return null;
  }

  // For mobile, show dialog; for desktop, show dropdown
  return (
    <div className="flex items-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 max-w-[120px] sm:max-w-none"
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate hidden xs:inline">
              {selectedEvent?.nome || 'Evento'}
            </span>
            <span className="xs:hidden">Evento</span>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg text-foreground">Selecionar Evento</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 pr-2">
              {availableEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventChange(event.id)}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${currentEventId === event.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-card border-border hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex-shrink-0 mt-1">
                    {currentEventId === event.id ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                      {event.nome}
                    </h4>
                    {event.local && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        📍 {event.local}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {event.data_inicio && (
                        <Badge variant="outline" className="text-xs">
                          {formatDate(event.data_inicio)}
                        </Badge>
                      )}
                      {event.status && (
                        <Badge 
                          variant={event.status === 'ativo' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {event.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
